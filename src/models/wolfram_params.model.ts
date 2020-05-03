// interface funct_property { (): void }
export interface WolframParams {
    mode: number;
    base: number;
    kernel: string;
    shape: string;
    type: string;
    grid: {width:number, height: number};
    init_row: {
        mode: number;
        group_size: number;
    }
}