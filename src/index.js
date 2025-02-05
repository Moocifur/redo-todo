// index.js
import "./styles.css";
import { greeting } from "./greeting.js";

console.log(greeting);

import odinImage from "./sonic.jpg";
   
const image = document.createElement("img");
image.src = odinImage;
   
document.body.appendChild(image);
