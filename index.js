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
      addToZindex: (zIndex, component, nodeHandle) => {
        const wrapperRef = React.findNodeHandle(this.refs.wrapper);
        UIManager.measureLayout(nodeHandle, wrapperRef,this.logMeasure, this.logMeasure);
        const {layers} = this.state;
        if (zIndex <= 0 || zIndex > 10) {
          // TODO(ftufek): document this limitation and investigate
          // if there's a useful usecase for having more than 10 layers
          return;
        }
        if (layers[zIndex]) {
          layers[zIndex].push(component);
        } else {
          layers[zIndex] = [component];
        }
        this.setState({layers});
      },
      removeFromZindex: function(component) {

      }
    };
  }

  logMeasure(ox, oy, width, height, px, py) {
    console.log("ox: " + ox);
    console.log("oy: " + oy);
    console.log("width: " + width);
    console.log("height: " + height);
    console.log("px: " + px);
    console.log("py: " + py);
  }

  render() {
    const {layers} = this.state;
    let layerComponents = [];
    for(let i = 0; i <= 10; i++) {
      // TODO(ftufek): make this more efficient...
      const layer = layers[i];
      if (layer) {
        for (let j = 0; j <= layer.length; j++) {
          layerComponents.push(layer[j]);
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

class Zindex extends Component {
  componentDidMount() {
    this.context.addToZindex(1, this.props.children,React.findNodeHandle(this.refs.vref));
    UIManager.measure(React.findNodeHandle(this.refs.vref), this.logMeasure);
    //this.props.children.measure(this.logMeasure);
  }

  logMeasure(ox, oy, width, height, px, py) {
    console.log("ox: " + ox);
    console.log("oy: " + oy);
    console.log("width: " + width);
    console.log("height: " + height);
    console.log("px: " + px);
    console.log("py: " + py);
  }

  render() {
    return (
      <View ref="vref" style={styles.wrapper}>
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
});

module.exports = {
  ZindexWrapper,
  Zindex,
};
