'use strict';
import React, {
  Component,
  Children,
  NativeModules,
  PropTypes,
  StyleSheet,
  Text,
  View
} from 'react-native';
const {UIManager} = NativeModules;

class ZindexWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {layers: []};
  }
  getChildContext() {
    return {
      addToZindex: (zIndex, component, nodeRef) => {
        const wrapperRef = React.findNodeHandle(this.refs.wrapper);
        nodeRef.measureLayout(wrapperRef,
               (x, y, width, height)=>{this.addToLayer(zIndex, component, x, y, width, height);},
               ()=>{console.log(arguments);});
      },
      removeFromZindex: function(component) {

      }
    };
  }

  addToLayer(zIndex, component, x, y, width, height) {
    const {layers} = this.state;
    if (zIndex <= 0 || zIndex > 10) {
      // TODO(ftufek): document this limitation and investigate
      // if there's a useful usecase for having more than 10 layers
      return;
    }
    const obj = {
      component,
      x,
      y,
      width,
      height,
    };
    if (layers[zIndex]) {
      layers[zIndex].push(obj);
    } else {
      layers[zIndex] = [obj];
    }
    this.setState({layers});
  }

  render() {
    const {layers} = this.state;
    let layerComponents = [];
    for(let i = 0; i <= 10; i++) {
      // TODO(ftufek): make this more efficient...
      const layer = layers[i];
      if (layer) {
        for (let j = 0; j < layer.length; j++) {
          //layerComponents.push(layer[j]);
          const cLayer = layer[j];
          const styleobj = {
            'position': 'absolute',
            'top': cLayer.y,
            'left': cLayer.x,
            'width': cLayer.width,
            'height': cLayer.height,
          };
          layerComponents.push(
            <View style={styleobj}>
              {cLayer.component}
            </View>
          );
        }
      }
    }
    return (
      <View style={styles.wrapper} ref="wrapper">
        {this.props.children}
        {layerComponents}
      </View>
    );
  }

  static childContextTypes = {
    addToZindex: PropTypes.func,
    removeFromZindex: PropTypes.func,
  };
}

class ZindexView extends Component {
  componentDidMount() {
    //this.context.addToZindex(1, this.props.children,React.findNodeHandle(this.refs.vref));
    //UIManager.measure(React.findNodeHandle(this.refs.vref), this.logMeasure);
    //this.props.children.measure(this.logMeasure);
    //debugger;
    //this.refs.vref.measure([>React.findNodeHandle(this.refs.vref),<]this.logMeasure);
  }

  logMeasure(ox, oy, width, height, px, py) {
    console.log("ox: " + ox);
    console.log("oy: " + oy);
    console.log("width: " + width);
    console.log("height: " + height);
    console.log("px: " + px);
    console.log("py: " + py);
  }

  updateLayoutMeasurements() {
    //this.refs.vref.measure(this.logMeasure);
    this.context.addToZindex(1, this.props.children,this.refs.vref);
  }

  render() {
    return (
      <View style={styles.zindex} ref="vref" onLayout={
        (event) => {
          this.updateLayoutMeasurements();
        }
      }>
      </View>
    );
  }

  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  static contextTypes = {
    addToZindex: PropTypes.func,
    removeFromZindex: PropTypes.func,
  };
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  zindex: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
  },
});

module.exports = {
  ZindexWrapper,
  ZindexView,
};
