import { KernelGenerator } from './kernel_generator';
import { InitRowGenerator } from './init_row_generator';
import { Kernel } from './models/kernel.model';
import { WolframParams } from './models/wolfram_params.model';
import { ParameterGenerator } from './parameter_generator';

export class Wolfram {
    row_index = 0;
    init_row_machine: InitRowGenerator;
    param_machine: ParameterGenerator;
    kernel_machine: KernelGenerator;
    kernel: Kernel;
    next_row: string[] = [];
    seed_length: number;
    neighborhoods: any[] = [];
    seed: string;

    public init_rows: number[][] = [];
    public current_rows: number[][] = [];

    constructor(private params: WolframParams){
        this.init_row_machine = new InitRowGenerator();
        this.param_machine = new ParameterGenerator();
    }


    Initialize(seed = ''){
        this.next_row = new Array(this.params.grid.width).fill(0);
        this.initKernel();
        this.initStartRows();
        this.initTotalisticNeighborhoods();
        this.seed = seed;
        if(seed == '')
            this.seed = this.param_machine.rand_int(this.params.base,this.seed_length)
        
        console.log(this.params.type,' seed ->' ,this.seed)
    }

    initKernel(){
        this.kernel_machine = new KernelGenerator();
        this.kernel = this.kernel_machine.GenerateKernel(this.params.kernel);
    }

    initStartRows(){
        for(let row_index = 0; row_index < this.kernel.dims.y; row_index++){
            let row = this.init_row_machine.generate_row(
                row_index,
                this.params.base,
                this.params.grid.width
            )
            this.init_rows.push(row)
            this.current_rows.push(row)
        }
    }

    initTotalisticNeighborhoods(){
        this.neighborhoods = [];
        let pad = (num, places) => String(num).padStart(places, '0')
        let seed_length = Math.pow(this.params.base,this.kernel.length)
        for(let i = 0; i < seed_length; i++){
            let num = pad(i.toString(this.params.base),this.kernel.length)
            let avg = 0;
            num.split('').forEach(v => avg += parseInt(v))
            avg = this.round((avg / this.kernel.length) / (this.params.base - 1))
            if(!this.neighborhoods.includes(avg))
                this.neighborhoods.push(avg)
        }
        this.seed_length = this.neighborhoods.length
        // console.log(this.params.type,'this.neighborhoods',this.neighborhoods, this.seed_length)
    }

    getInitRows(){
        return this.init_rows;
    }

    generateRow(){
        const row = this.generateTotalisticRow()
        this.current_rows.pop()
        this.current_rows.push(row)
        return row
    }

    generateTotalisticRow(){
        let next_row = []
        let kernel_slices = [];
        for(let i = 0; i < this.params.grid.width; i++){
            let kernel_slice = '';
            for(let j = this.kernel.length - 1; j >= 0; j--){
                let x_index = (i + this.kernel.offsets[j].x)
                let y_index = this.kernel.offsets[j].y
                if(x_index < this.params.grid.width && x_index >= 0)
                    kernel_slice += this.current_rows[y_index][x_index].toString()
                else
                    kernel_slice += '0'
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
