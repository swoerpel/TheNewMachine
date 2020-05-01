import { KernelGenerator } from './kernel_generator';
import { InitRowGenerator } from './init_row_generator';
import { wolfram_modes } from './params';
import { Kernel } from './models/kernel.model';
import { WolframParams } from './models/wolfram_params.model';
import { ParameterGenerator } from './parameter_generator';

export class Wolfram {
    row_index = 0;
    init_row_machine: InitRowGenerator;
    param_machine: ParameterGenerator;
    kernel_machine: KernelGenerator;
    kernel: Kernel;
    current_rows: number[][] = [];
    init_rows: number[][] = [];
    next_row: string[] = [];
    seed_length: number;
    neighborhoods: any[] = [];
    seed: string;

    constructor(private params: WolframParams){
        this.init_row_machine = new InitRowGenerator();
        this.param_machine = new ParameterGenerator();
        // console.log('WOLFRAM PARAMS LOW ->', params)
    }


    Initialize(){
        this.next_row = new Array(this.params.grid.width).fill(0);
        this.initKernel();
        this.initStartRows();
        this.initNeighborhoods();
        this.seed = this.param_machine.rand_int(this.params.base,this.seed_length)
    }

    initKernel(){
        this.kernel_machine = new KernelGenerator();
        this.kernel = this.kernel_machine.GenerateKernel(this.params.kernel);
    }

    initStartRows(){
        for(let i = 0; i < this.kernel.dims.y; i++){
            let row = this.init_row_machine.generate_row(
                this.params.init_row.mode,
                this.params.base,
                this.params.grid.width,
                this.params.init_row.group_size + i
            )
            this.init_rows.push(row)
            this.current_rows.push(row)
        }
    }

    getInitRow(index){
        return this.init_rows[index]
    }

    initNeighborhoods(){
        if(this.params.base == 1){
            console.log('Wolfram number base = 1 which doesnt work... (maybe shape size array length)')
            this.seed_length = -1
        }
        this.neighborhoods = [];
        let pad = (num, places) => String(num).padStart(places, '0')
        //traditional
        if(wolfram_modes[this.params.mode] ==  wolfram_modes[0]){
            let seed_length = Math.pow(this.params.base,this.kernel.length)
            for(let i = 0; i < seed_length; i++){
                let num = i.toString(this.params.base)
                this.neighborhoods.push(pad(num,this.kernel.length))
            }
        }
        //totalistic
        else if(wolfram_modes[this.params.mode] ==  wolfram_modes[1]) { 
            let seed_length = Math.pow(this.params.base,this.kernel.length)
            for(let i = 0; i < seed_length; i++){
                // console.log('this.params.base', this.params.base)
                
                let num = pad(i.toString(this.params.base),this.kernel.length)
                let avg = 0;
                num.split('').forEach(v => avg += parseInt(v))
                avg = this.round((avg / this.kernel.length) / (this.params.base - 1))
                if(!this.neighborhoods.includes(avg))
                    this.neighborhoods.push(avg)
            }
        }
        this.seed_length = this.neighborhoods.length
        // console.log('neighborhoods',this.neighborhoods)
    }


    generateRow(){
        let row;
        if(wolfram_modes[this.params.mode] ==  wolfram_modes[0])
            row = this.generateTraditionalRow()
        else if(wolfram_modes[this.params.mode] ==  wolfram_modes[1])
            row = this.generateTotalisticRow()
        this.current_rows.pop()
        this.current_rows.push(row)
        return row
    }

    generateTraditionalRow(){
        // console.log('this.current_rows',this.current_rows)
        let next_row = []
        let kernel_slices = [];
        for(let i = 0; i < this.params.grid.width; i++){
            let kernel_slice = '';
            // console.log('this.kernel',this.kernel)
            for(let j = this.kernel.length - 1; j >= 0; j--){
                let x_index = (i + this.kernel.offsets[j].x) % (this.params.grid.width)
                let y_index = this.kernel.offsets[j].y % (this.params.grid.height)
                if(x_index < 0)
                    x_index = this.params.grid.width + x_index
                // console.log(x_index,y_index,this.current_rows)
                kernel_slice += this.current_rows[y_index][x_index].toString()
            }
            kernel_slices.push(kernel_slice)
        }
        for(let j = 0; j < kernel_slices.length; j++){
            this.neighborhoods.map((n,index)=>{
                if(kernel_slices[j] == n)
                    next_row.push(Math.floor(parseInt(this.seed[index])))
            });
        }
        this.row_index++;
        return next_row
    }

    getRowIndex(){
        return this.row_index;
    }

    generateTotalisticRow(){
        let next_row = []
        let kernel_slices = [];
        for(let i = 0; i < this.params.grid.width; i++){
            let kernel_slice = '';
            for(let j = this.kernel.length - 1; j >= 0; j--){
                let x_index = (i + this.kernel.offsets[j].x) % (this.params.grid.width)
                let y_index = this.kernel.offsets[j].y
                if(x_index < 0)
                    x_index = this.params.grid.width + x_index
                kernel_slice += this.current_rows[y_index][x_index].toString()
            }
            kernel_slices.push(kernel_slice)
        }
        for(let j = 0; j < kernel_slices.length; j++){
            this.neighborhoods.map((n,index)=>{
                let avg = 0;
                [...kernel_slices[j]].forEach(v => avg += Math.floor(v))
                avg = this.round((avg / this.kernel.length) / (this.params.base - 1))
                if(avg == n)
                    next_row.push(Math.floor(parseInt(this.seed[index])))
            });
        }
        return next_row
    }

    round(N,acc = 100000){
        return Math.round(N * acc) / acc
    }

}