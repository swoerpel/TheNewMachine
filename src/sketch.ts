import * as p5 from 'p5'
import 'p5/lib/addons/p5.sound'
import {params} from './params'
import { WolframImage } from './wolfram_image';

var sketch = function (p: p5) {
  var pause = false;
  var canvas;
  var graphic;
  var img1;
  var image_index = 0;
  var draw_index;
  
  p.setup = function () {
    setupGraphics()
    setupImages(params.color.palette)
  }

  function setupGraphics(){

    canvas = p.createCanvas(params.canvas.width, params.canvas.height);
    canvas.background('black')
    graphic = p.createGraphics(params.canvas.width, params.canvas.height)
    graphic.stroke('white')
  }

  function setupImages(prev_color_palette = ''){
    img1 = new WolframImage(image_index);
    img1.setGraphic(graphic);
    img1.setColors(prev_color_palette);
    draw_index = 0
  }

  function incDrawIndex(){
    let k_offset = img1.dataGenerators.default_colors.kernel.dims.y
    if(params.draw.mode == 'fixed'){
      draw_index = draw_index + 1
      if(draw_index == params.images[image_index].grid.height + k_offset){
        pause = true;
        draw_index = 0;
      }
    } else if(params.draw.mode == 'cycle'){
      // draw_index = (draw_index + 1) % (params.images[image_index].grid.height); 
      draw_index = (draw_index + 1) % (params.images[image_index].grid.height + k_offset); 
    }
  }

  function drawImageRow(){
    img1.drawRow(draw_index)
    p.image(graphic, 0, 0)
    incDrawIndex();
  }

  p.draw = function () {
    if(!pause){
      drawImageRow();
    }
  }

  p.keyPressed = function (event: KeyboardEvent):void{
    console.log(event)
    switch(event.key){
      case " ": pause = !pause;                                   break;
      case "c": img1.refreshColorMachine(); drawImageRow();       break;
      case "s": pause = true; drawImageRow();                     break;
      case "g": img1.graphic.background(0); p.image(graphic,0,0); break;
      case "r": setupImages(img1.color_palette);                  break;
      case "d": draw_index = 0;                                   break;
    }
  }
}

new p5(sketch)
