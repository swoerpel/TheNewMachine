import { params, default_shape_properties, wolfram_kernels } from './params'
import { Wolfram } from './wolfram';
import { WolframParams } from './models/wolfram_params.model';
import * as chroma from 'chroma.ts';
import { chromotome_palettes } from './chromotome';
import { DrawCircle, DrawTriangle } from './draw_shapes';

export class WolframImage{
    dataGenerators: { [key: string] : Wolfram, color : Wolfram } = {};
    palettes = {};
    color_machine;
    graphic;
    draw_index = 0;
    shapeLUT = {
        'circle': () => this.initCircle(),
        'rectangle': () => this.initRect(),
        'triangle': () => this.initTriangle()
    }
    color_palette: string[];
    img_params: Partial<WolframParams>;
    constructor(image_index){
        this.img_params = params.images[image_index];
        
        let data_grid_keys = [
            '_color',
            'size',
            'subshape',
            'subshape_size',
            'color_alpha',
            'rotation'
        ]
        data_grid_keys.map((key) =>{
            this.dataGenerators[key] = this.initDataGridPair(key)
        })
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

    drawRow(draw_index){
        this.graphic.strokeWeight(0);
        let row_index = draw_index;
        let rows = [];
        let row_group = {}
        if(row_index == 0){
            for(let i = 0; i < wolfram_kernels[this.img_params.kernel].length; i++){
                Object.entries(this.dataGenerators).forEach(([key,value]) => {
                    // console.log('value',value)
                    // console.log('key,value',key,value)

                    // let init_row = value[key].getInitRow(row_index)
                    // row_group[key] = {
                        // [key]: [...init_row],
                        // color: [...init_row]
                    // }
                    row_group[key] = value[key].getInitRow(row_index)
                    row_group[key + '_color'] = value.color.getInitRow(row_index)
                    // row_group[key + '_color'] = value.color.getInitRow(row_index)
                })
                rows.push(row_group)  
            }
            // console.log(row_group)

        }else {
            Object.entries(this.dataGenerators).forEach(([key,value]) => {
                
                // row_group[key] = {
                    // [key]: [...value[key].generateRow()],
                    // color: [...value.color.generateRow()]
                // }
                row_group[key] = [...value[key].generateRow()]
                row_group[key + '_color'] = [...value.color.generateRow()]
                // row_group[key + '_color'] = value.color.getInitRow(row_index)

            })
            const cell_width = params.canvas.width / this.img_params.grid.width
            const cell_height = params.canvas.height / this.img_params.grid.height
                // _color is present in every data grid
            for(let j = 0; j < row_group._color.length; j++){
                let origin = {
                    x: j * cell_width,
                    y: row_index * cell_height,
                    cx: j * cell_width + (cell_width / 2),
                    cy: row_index * cell_height + (cell_height / 2)
                }
                let cell = {
                    index: j,
                    width: cell_width,
                    height: cell_height,
                }
                // _color is present in every data grid
                const offset = this.dataGenerators._color.color.kernel.dims.y; 
                this.graphic.translate(0,-cell_height * offset)
                // DrawTriangle(this.graphic, row_group, origin, cell, this.color_machine)
                DrawCircle(this.graphic, row_group, origin, cell, this.color_machine)
                this.graphic.translate(0,cell_height * offset)
                
            }
        }
    }


    private initDataGridPair(primary_grid_type){
        let dataGridParamsPair ={
            color: Object.assign({}, this.img_params),
            [primary_grid_type]: Object.assign({}, this.img_params),
        }
        let base =  default_shape_properties.shape_sizes.length 
        if(primary_grid_type === '_color')
            base = default_shape_properties.colors;
        dataGridParamsPair[primary_grid_type].base = base
        dataGridParamsPair.color.base = base;
        let primary_grid = new Wolfram(<WolframParams>dataGridParamsPair[primary_grid_type])
        primary_grid.Initialize();
        let color_grid = new Wolfram(<WolframParams>dataGridParamsPair.color)
        color_grid.Initialize();
        return{
            [primary_grid_type]: primary_grid,
            color: color_grid,
        }
    }


    //initializes properties unique to each shape
    private initCircle(){

    }

    private initRect(){

    }

    private initTriangle(){
        let rotation_params = Object.assign({}, this.img_params);
        rotation_params.base = default_shape_properties.rotations.length;
        this.dataGenerators['rotation'] = new Wolfram(<WolframParams>rotation_params);
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
        console.log('this.color_machine',this.color_machine(0),this.color_machine(1))
    }


  
}