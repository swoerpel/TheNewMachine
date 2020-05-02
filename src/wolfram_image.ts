import { params, shape_properties } from './params'
import { Wolfram } from './wolfram';
import { WolframParams } from './models/wolfram_params.model';
import * as chroma from 'chroma.ts';
import { chromotome_palettes } from './chromotome';
import { DrawCircle, DrawTriangle } from './draw_shapes';

export class WolframImage{
    dataGenerators: any = {};
    palettes = {};
    color_machine;
    graphic;
    draw_index = 0;
    color_palette: string;
    img_params: any;//Partial<WolframParams>;


    dataGridGroupPropsLUT = {
        'circle' : [
            { type:'default_colors', base: shape_properties.default_colors} ,
            { type:'shape_sizes', base: shape_properties.shape_sizes.length} ,
            { type:'subshapes', base: shape_properties.subshapes.length} ,
            { type:'subshape_sizes', base: shape_properties.subshape_sizes.length} ,
            { type:'color_alpha_values', base: shape_properties.color_alpha_values.length} ,
        ]
    }

    constructor(image_index){
        this.img_params = params.images[image_index];
        const data_grid_props = [...this.dataGridGroupPropsLUT['circle']]
        data_grid_props.map((prop) =>{
            this.dataGenerators[prop.type] = this.dataGridFactory(prop.type, prop.base);
        })
        console.log('this.dataGenerators',this.dataGenerators)
    }
    
    private dataGridFactory(grid_type, base){
        let data_grid_params = Object.assign({
            base: base,
            type: grid_type,
        }, this.img_params);
        let data_grid = new Wolfram(<WolframParams>data_grid_params)
        data_grid.Initialize();
        return data_grid
    }

    drawRow(row_index){
        this.graphic.strokeWeight(0);
        let row_group:any = {}
        Object.entries(this.dataGenerators).forEach(([key,value]:[any,any]) => {
            row_group[key] = [...value.generateRow()]
        })
        for(let cell_index = 0; cell_index < row_group.default_colors.length; cell_index++){
            let cell = this.getCell(cell_index,row_index)
            const offset = this.dataGenerators.default_colors.kernel.dims.y; 
            this.graphic.translate(0,-cell.height * offset)
            this.drawShapeLUT[params.images[0].shape](this.graphic, this.color_machine, row_group, cell);
            this.graphic.translate(0,cell.height * offset)
        }
    }

    drawShapeLUT = {
        'circle': (graphic, color_machine, row_group, cell) => DrawCircle(graphic, color_machine, row_group, cell),
        'triangle': (graphic, color_machine, row_group, cell) => DrawTriangle(graphic, color_machine, row_group, cell),
    }

    getCell(cell_index, row_index){
        const cell_width = params.canvas.width / this.img_params.grid.width
        const cell_height = params.canvas.height / this.img_params.grid.height
        return {
            index: cell_index,
            width: cell_width,
            height: cell_height,
            origin:{
                x: cell_index * cell_width,
                y: row_index * cell_height,
                cx: cell_index * cell_width + (cell_width / 2),
                cy: row_index * cell_height + (cell_height / 2)
            }
        }
    }

    private refreshColorMachine(palette_name = ''){
        if(palette_name != ''){
            this.color_palette = palette_name
            this.color_machine = chroma.scale(this.palettes[palette_name]);
        }else{
            let pal_names = Object.keys(this.palettes);
            let rand_index = Math.floor(pal_names.length * Math.random())
            this.color_palette = pal_names[rand_index]
            this.color_machine = chroma.scale(this.palettes[this.color_palette]);
        }
    }

    setGraphic(graphic){
        this.graphic = graphic
    }

    setColors(palette_name){
        for (let i = 0; i < chromotome_palettes.length; i++) {
            let key = chromotome_palettes[i].name;
            this.palettes[key] = new Object(chromotome_palettes[i].colors);
        }
        this.palettes = { ...this.palettes, ...chroma.brewer };
        this.refreshColorMachine(palette_name)
    }
}