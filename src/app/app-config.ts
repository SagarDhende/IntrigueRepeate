
export interface ThemeConfig{
    layout:string,
    subLayout:string,
    collapseMenu: boolean,
    layoutType: string,
    headerBackColor: string,
    navBrandColor:string,
    rtlLayout: boolean,
    navFixedLayout: boolean,
    headerFixedLayout:boolean,
    boxLayout:boolean,
    bodyBackground:string
  }
  
  export class NextConfig {
    public static config:ThemeConfig = {
      layout: 'vertical', // vertical, horizontal
      subLayout: '', // horizontal-2
      collapseMenu: true,
      layoutType: 'menu-dark', // menu-dark, menu-light, dark
      headerBackColor: 'header-dark', // header-default, header-blue, header-red, header-purple, header-info, header-dark
      navBrandColor: 'brand-dark', // brand-default, brand-blue, brand-red, brand-purple, brand-info, brand-dark
      rtlLayout: false,
      navFixedLayout: true,
      headerFixedLayout: true,
      boxLayout: false,
      bodyBackground: 'body-dark'
    };

}