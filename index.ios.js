/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
//var Sample=require("./src/index.js");
const { Surface } = require("gl-react-native");
const GL = require("gl-react");
const forth2gl=require("./forth2gl");
const StockCodeButtons=require("./src/stockcodebuttons");
var {
  AppRegistry,
  Image,
  ListView,
  StyleSheet,
  Text, 
  TextInput,
  View,
  ScrollView,
  PixelRatio,
  TouchableHighlight,
  Dimensions,
} = React;
var shader;
var frag=`precision highp float;
varying vec2 uv; 
void main () { 
  gl_FragColor = vec4(uv.x, uv.y,0,1.0); 
}
    `
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
var GetTime=function() {
  var dt = new Date();
  var tm = dt.getHours();
  tm = tm * 60 + dt.getMinutes();
  tm = tm * 60 + dt.getSeconds();
  tm = tm + dt.getMilliseconds() / 1000.0;
  return tm;
}

var forthhaiku = React.createClass({
  getInitialState:function(){
    return { frag:frag, forthcode:'x t sin .5 * .5 +',time_val:0};
  }
  ,animation:false
  ,onChangeForth:function(forthcode) {
    console.log('changing Forth code');
    this.setState({forthcode:forthcode});
  }
  ,onChangeFrag:function(text){
    this.setState({frag:text});
  }
  ,setCode:function(forthcode){
    this.setState({forthcode},function(){
      this.updatefrag();
    }.bind(this));
  }
  ,updatefrag:function(){
    var frag=forth2gl.transpile(this.state.forthcode);
    if(frag.match(/= time_val/)){
      this.animation=true;
      requestAnimationFrame(this.step);
    } else {
      frag=frag.replace(/[^\n]*time_(delta_)?val*[^\n]*\n/g,'');
      this.animation=false;
    }

    shader=GL.Shaders.create({Haiku:{frag:frag}});
    this.forceUpdate();
  }
  ,step:function(){
    if(!this.animation)return;
    this.setState({time_val:GetTime()},function(){
      requestAnimationFrame(this.step);
    }.bind(this));
  }
  ,componentWillMount:function(){
    shader=GL.Shaders.create({Haiku:{frag:frag}})
  }
  ,render: function() {
    var uniforms=this.animation?{time_val:this.state.time_val}:null;

    return <View style={{flex:1}}>
    <View style={{height:20}}/>
    <View style={{paddingLeft:width*0.2}}>
     <Surface width={width*0.60} height={width*0.60} ref="helloGL">
          <GL.Node shader={this.getShaderHaiku()} uniforms={uniforms}
          />
      </Surface>
    </View>
    <StockCodeButtons setCode={this.setCode}/>
    <View style={{flexDirection:'row'}}>
    
    <TouchableHighlight underlayColor='white' activeOpacity={0.5} style={styles.runhighlight} onPress={this.updatefrag}>
    <Text style={styles.runbutton}>Run</Text></TouchableHighlight>
    <Text>Name:</Text>
    <TextInput ref="name" style={{width:160,height:25,borderColor:'black',
    borderWidth:(1/PixelRatio.get())}}/>
    </View>
    <ScrollView styles={{flex:1}}>
    <TextInput ref="forthcode" multiline={true} 
    style={{fontSize:16,height:240,borderColor:'gray',borderWidth:(1/PixelRatio.get())}}
    onChangeText={this.onChangeForth}
    value={this.state.forthcode}/>

    <TextInput ref="frag" multiline={true} style={{fontSize:16,height:120,borderColor:'gray',borderWidth:1}}
    onChangeText={this.onChangeFrag}
    value={this.state.frag}/>    
    </ScrollView>
    </View>
  }
  ,getShaderHaiku:function(){
    var haiku=shader.Haiku, frag=haiku.frag;
    if(frag)
      console.log('haiku.frag.match(/time_val/)',frag.match(/time_val/));
    return haiku;
  }
});

var styles = StyleSheet.create({
  runhighlight:{shadowRadius:5},
 runbutton:{textAlign:'center',textShadowRadius:10,fontSize:18,
 textShadowColor:'black',borderWidth:1,height:25*PixelRatio.get(),borderRadius:5,width:150}
});

AppRegistry.registerComponent('forthhaiku', () => forthhaiku);
