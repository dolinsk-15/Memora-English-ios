declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }

  class Icon extends Component<IconProps> {}
  export default Icon;
} 