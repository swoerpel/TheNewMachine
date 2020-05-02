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
    color_palette: string;
    img_params: any;//Partial<WolframParams>;
    constructor(image_index){
        this.img_params = params.images[image_index];
        let data_grid_keys = Object.keys(shape_properties)


        data_grid_keys.push('default')
        data_grid_keys.map((key) =>{
            // this.dataGenerators[key] = this.dataGridLUT['default']();
            this.dataGenerators[key] = this.initDataGridPair(key)
        })
        console.log('this.dataGenerators',this.dataGenerators)
    }


    dataGridLUT = {
        default:() =>        this.dataGridFactory('default', shape_properties.colors),
        shape_sizes:() =>    this.dataGridFactory('shape_sizes', shape_properties.shape_sizes.length),
        rotations:() =>      this.dataGridFactory('rotations', shape_properties.rotations.length),
        subshapes:() =>      this.dataGridFactory('subshapes', shape_properties.subshapes.length),
        subshape_sizes:() => this.dataGridFactory('subshape_sizes', shape_properties.subshape_sizes.length),
    }
    
    private dataGridFactory(grid_type, base){
        let data_grid_params = Object.assign({
            base: base,
            type: grid_type,
        }, this.img_params);
        let data_grid = new Wolfram(<WolframParams>data_grid_params)
        return data_grid.Initialize();
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
        dataGridParamsPair[primary_grid_type].type = primary_grid_type
        dataGridParamsPair.color.type = primary_grid_type + '-color';
        let primary_grid = new Wolfram(<WolframParams>dataGridParamsPair[primary_grid_type])
        primary_grid.Initialize();
        let color_grid = new Wolfram(<WolframParams>dataGridParamsPair.color)
        color_grid.Initialize();
        return{
            [primary_grid_type]: primary_grid,
            color: color_grid,
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