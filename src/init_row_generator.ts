

export class InitRowGenerator{
    constructor(){ }

    generate_row(alg_index,base,length,group_size, offset = 0):number[]{
        if(alg_index == 0)
            return this.rand_row(base,length,group_size,offset)
        if(alg_index == 1)
            return this.step_row(base,length,group_size,offset)
        if(alg_index == 2)
            return this.alt_step_row(base,length,group_size,offset)
        if(alg_index == 3 || alg_index == 4 || alg_index == 5)
            return this.group_row(base,length,group_size,alg_index % 3)
    }

    rand_row(base,length,group_size,offset = 0): number[]{
        let row: number[] = [];
        let rand_val = Math.floor(Math.random() * base)
        for(let i = 0; i < length; i++){
            row.push(
                rand_val
            )
            if(i % group_size == 0)
                rand_val = Math.floor(Math.random() * base)
        }
        return row
    }

    step_row(base,length, group_size = 1, offset = 0):number[]{
        let row = [];
        let count = 0;
        for(let i = 0; i < length / group_size; i++){
            let val = (count + offset) % base
            for(let j = 0; j < group_size; j++){
                row.push(val)
            }
            count++;
        }
        return row.slice(0,length)
    }

    alt_step_row(base,length, group_size = 1, offset = 0):number[]{
        let row = [];
        let up = new Array(new Array(base).keys())
        let down = up.reverse().slice(1,base - 1)
        let step = up.concat(down)
        for(let i = 0; i < length; i++)
            for(let j = 0; j < group_size; j++)
                row.push(step[(i + offset) % step.length])
        return row
    }

    group_row(base,length, group_size = 1, justify = 1):number[]{
        // 0->left _ 1->center _ 2->right
        let row = new Array(length).fill(0)
        let center_index;
        if (justify == 0)
            center_index = (base - 1)
        if (justify == 1)
            center_index = Math.floor(length / 2)
        if (justify == 2)
            center_index = length - base
        for(let i = 0; i < length; i++){
            if (i == center_index){
                for(let j = 0; j < base; j++)
                    row[i + j] = ((base - 1) - j)
                for(let j = 1; j < base; j++)
                    row[i - j] = ((base - 1) - j)
            }
        }
        return row
    }
}