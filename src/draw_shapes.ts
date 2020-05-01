import { default_shape_properties } from './params';

export var DrawCircle = (graphic,color_machine,row, cell) => {
    let color_value = row.default_color[cell.index] / default_shape_properties.colors
    let co = color_machine(color_value).rgba()
    co[3] = 255 * default_shape_properties.color_alpha_values[row.color_alpha_values[cell.index]]
    graphic.fill(co)
    let radius = default_shape_properties.shape_sizes[row.shape_sizes[cell.index]] * cell.width;
    graphic.circle(cell.origin.cx, cell.origin.cy, radius)
}


export var DrawTriangle = (graphic,row,origin, cell, color_machine) => {
    // if(row.subshapes[cell.index] == 0){
    let i = 0;
    if(row.size){
        i = row.size[cell.index]
    }
    for(i; i>=0 ; i--){
        const size_value = default_shape_properties.shape_sizes[i];
        let cell_length = cell.width * size_value;
        // let cell_length = cell.width * Math.sqrt(2) * size_value;
        let points = [
            {
                x: origin.cx,
                y: origin.cy,
            },
            {
                x: origin.cx + cell_length / 2,
                y: origin.cy + cell_length / 2
            },
            {
                x: origin.cx - cell_length / 2,
                y: origin.cy + cell_length / 2
            },
            {
                x: origin.cx - cell_length / 2,
                y: origin.cy - cell_length / 2
            },
        ]
        let color_value = row._color[cell.index] / default_shape_properties.colors
        // color_value = 1 - color_value / (i + 1)
        // let c = p5.Color

        Array.from(new Set(row.rotation_color).values()).map((r) => {
            let co = color_machine(color_value).rgba()
            // co[3] = 255 * 1/r
            co[3] = 255 * default_shape_properties.color_alpha_values[row.color_alpha[cell.index]]
            graphic.fill(co)
            graphic.beginShape();
            let rotation_val = default_shape_properties.rotations[row.rotation[cell.index] + r]
            rotatePoints(points,origin,rotation_val).map((p) => {
                graphic.vertex(p.x,p.y)
            })
            graphic.endShape();
        })

    }
    // }else{
        // let sub_grid_diameter = default_shape_properties[row.subshapes[cell.index]]
        // // console.log('sub_grid_diameter',sub_grid_diameter)
        // let sub_cell_width = sub_grid_diameter / cell.width;
        // let sub_cell_height = sub_grid_diameter / cell.height;

        // for(let x = 0; x < sub_grid_diameter; x++){
        //     for(let y = 0; y < sub_grid_diameter; y++){
        //         let sub_origin = {
        //             cx: origin.x + x * sub_cell_width,
        //             cy: origin.y + y * sub_cell_height
        //         }
        //         graphic.fill(color_machine(color_value).hex())
        //         graphic.circle(sub_origin.cx, sub_origin.cy, sub_cell_width)
        //     }
        // }
    // }
    
}

function rotatePoints(points,origin,rotation){
    let radians = rotation * Math.PI / 180
    let new_points = [];
    for(let i = 0; i < points.length; i++){
        let x = points[i].x
        let y = points[i].y
        let cos = Math.cos(radians)
        let sin = Math.sin(radians)
        let nx = (cos * (x - origin.cx)) + (sin * (y - origin.cy)) + origin.cx
        let ny = (cos * (y - origin.cy)) - (sin * (x - origin.cx)) + origin.cy
        new_points.push({
            x: nx,
            y: ny
        })
    }
    return new_points
}