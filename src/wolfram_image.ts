import { params, shape_properties, wolfram_kernels } from './params'
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
    shapeLUT = {
        'circle': () => this.initCircle(),
        'rectangle': () => this.initRect(),
        'triangle': () => this.initTriangle()
    }
    color_palette: string;
    img_params: Partial<WolframParams>;
    constructor(image_index){
        this.img_params = params.images[image_index];
        let data_grid_keys = Object.keys(shape_properties)

        data_grid_keys.push('default')
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

    drawRow(row_index){
        this.graphic.strokeWeight(0);
        let row_group:any = {}

        Object.entries(this.dataGenerators).forEach(([key,value]:[any,any]) => {
            row_group[key] = [...value[key].generateRow()]
            row_group[key + '_color'] = [...value.color.generateRow()]
        })

        for(let cell_index = 0; cell_index < row_group.default.length; cell_index++){
            let cell = this.getCell(cell_index,row_index)
            const offset = this.dataGenerators.default.color.kernel.dims.y; 
            this.graphic.translate(0,-cell.height * offset)
            // DrawTriangle(this.graphic,this.color_machine, row_group, cell )
            DrawCircle(this.graphic,this.color_machine, row_group, cell )
            this.graphic.translate(0,cell.height * offset)
        }
    }


    private initDataGridPair(primary_grid_type){
        let dataGridParamsPair ={
            color: Object.assign({}, this.img_params),
            [primary_grid_type]: Object.assign({}, this.img_params),
        }
        let base =  shape_properties.shape_sizes.length 
        if(primary_grid_type === 'default')
            base = shape_properties.colors;
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
        rotation_params.base = shape_properties.rotations.length;
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
        console.log(this.color_palette)
        console.log('this.color_machine',this.color_machine(0),this.color_machine(1))
    }


  
}