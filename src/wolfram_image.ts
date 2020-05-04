import { params, shape_properties } from './params'
import { Wolfram } from './wolfram';
import { WolframParams } from './models/wolfram_params.model';
import * as chroma from 'chroma.ts';
import { chromotome_palettes } from './chromotome';
import { DrawCircle, DrawTriangle, DrawDebug } from './draw_shapes';

export class WolframImage{
    dataGenerators: any = {};
    palettes = {};
    color_machine;
    graphic;
    draw_index = 0;
    color_palette: string;
    img_params: any;//Partial<WolframParams>;
    data_generator_props: any;
    default_type: string;

    dataGridGroupPropsLUT = {
        'debug':[
            { type:'default_colors', base: shape_properties.default_colors, seed: ''} ,
        ],

        'circle' : [
            { type:'default_colors', base: shape_properties.default_colors} ,
            { type:'shape_sizes', base: shape_properties.shape_sizes.length} ,
            { type:'subshapes', base: shape_properties.subshapes.length} ,
            { type:'subshape_sizes', base: shape_properties.subshape_sizes.length} ,
            { type:'color_alpha_values', base: shape_properties.color_alpha_values.length} ,
        ]
    }

    drawShapeLUT = {
        'debug': (graphic, color_machine, row_group, cell) => DrawDebug(graphic, color_machine, row_group, cell),
        'circle': (graphic, color_machine, row_group, cell) => DrawCircle(graphic, color_machine, row_group, cell),
        'triangle': (graphic, color_machine, row_group, cell) => DrawTriangle(graphic, color_machine, row_group, cell),
    }

    constructor(image_index){
        this.img_params = params.images[image_index];
        const draw_mode = params.images[0].shape;
        this.data_generator_props = [...this.dataGridGroupPropsLUT[draw_mode]]
        this.default_type = this.data_generator_props[0].type
        this.data_generator_props.map((prop) =>{
            this.dataGenerators[prop.type] = this.dataGridFactory(prop.type, prop.base, prop.seed);
        })
        console.log('this.dataGenerators',this.dataGenerators)
    }
    
    private dataGridFactory(grid_type, base, seed){
        let data_grid_params = Object.assign({
            base: base,
            type: grid_type,
        }, this.img_params);
        let data_grid = new Wolfram(<WolframParams>data_grid_params)
        data_grid.Initialize(seed);
        return data_grid
    }

    drawInitRows(){
        let init_row_group:any = {}
        let init_row_count;
        Object.entries(this.dataGenerators).forEach(([data_type,data_grid]:[any,any], index) => {
            init_row_group[data_type] = {}
            init_row_group[data_type]['rows'] = []
            init_row_count = data_grid.init_rows.length
            for(let row_index = 0; row_index < init_row_count; row_index++){  
                let init_row = [...data_grid.getInitRow(row_index)]
                init_row_group[data_type].rows.push(init_row)
            }
        })
        const grid_width = init_row_group[this.default_type].rows[0].length
        init_row_group[this.default_type].rows.forEach((init_row, row_index) => {
            for(let cell_index = 0; cell_index < grid_width; cell_index++){
                let cell = this.getCellParams(cell_index,row_index)
                // console.log('init_row',init_row)
                this.drawShapeLUT[params.images[0].shape](
                    this.graphic, 
                    this.color_machine, 
                    {'default_colors': init_row}, 
                    cell
                );
            }
        })
        return init_row_count;
    }


    drawRow(row_index){
        this.graphic.strokeWeight(0);
        let row_group:any = {}
        Object.entries(this.dataGenerators).forEach(([data_type,data_grid]:[any,any]) => {
            row_group[data_type] = [...data_grid.generateRow()]
        })
        console.log('row_group',row_group)
        for(let cell_index = 0; cell_index < row_group.default_colors.length; cell_index++){
            let cell = this.getCellParams(cell_index,row_index)
            
            this.drawShapeLUT[params.images[0].shape](
                this.graphic, 
                this.color_machine, 
                row_group, 
                cell);
        }
    }



    getCellParams(cell_index, row_index){
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