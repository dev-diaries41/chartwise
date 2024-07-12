import { faCreditCard, faHome, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../types";

export const navLinks: NavItem[] = [
    { name: 'Home', link: '/', icon: faHome },
  ];
  
  export const footerLinks: NavItem[] = [
    { name: 'Support', link: '/support', icon: faQuestionCircle},
    { name: 'Pricing', link: '/pricing', icon: faCreditCard},
    { name: 'Terms', link: '/terms'},
    { name: 'License', link: '/license'},
    { name: 'Privacy policy', link: '/privacy'},
  ];
  

  export const headerLinks: NavItem[] = [
    { name: 'Support', link: '/support', icon: faQuestionCircle},
    { name: 'Pricing', link: '/pricing', icon: faCreditCard},
  ];
  
  