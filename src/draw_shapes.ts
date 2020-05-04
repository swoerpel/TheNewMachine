import { shape_properties } from './params';
import { round } from './helpers';

export var DrawDebug = (graphic,color_machine,row_group, cell) => {
    graphic.translate(-cell.width / 2,-cell.height / 2)
    // console.log(cell.index,row_group.default_colors)
    const cv = row_group.default_colors[cell.index] / shape_properties.default_colors
    // console.log(cv)
    graphic.fill(color_machine(cv).hex())
    graphic.rect(cell.origin.cx, cell.origin.cy, cell.width, cell.height)
    graphic.translate(cell.width / 2,cell.height / 2)
}

export var DrawCircle = (graphic,color_machine,row, cell) => {
    graphic.translate(-cell.width / 2,-cell.height / 2)

    graphic.strokeWeight(0)
    graphic.ellipseMode(graphic.CENTER)
    const sub_dim = shape_properties.subshapes[row.subshapes[cell.index]];
    if(sub_dim === 1){
        let radius = shape_properties.shape_sizes[row.shape_sizes[cell.index]] * cell.width;
        drawCircleStack(graphic,color_machine,row, cell.index,cell.origin, radius)
    }else{
        const sub_cell_width = cell.width / sub_dim;
        const sub_cell_height = cell.height / sub_dim;
        for(let x = 0; x < sub_dim; x++){
            for(let y = 0; y < sub_dim; y++){
                let sub_origin = {
                    x: cell.origin.x + x * sub_cell_width,
                    y: cell.origin.y + y * sub_cell_height,
                    cx: cell.origin.x + x * sub_cell_width + sub_cell_width / 2,
                    cy: cell.origin.y + y * sub_cell_height + sub_cell_height / 2,
                }
                let radius = shape_properties.subshape_sizes[row.subshape_sizes[cell.index]] * sub_cell_width;
                drawCircleStack(graphic,color_machine,row, cell.index,sub_origin, radius)
            }
        }
    }
    graphic.translate(cell.width / 2,cell.height / 2)
}

function drawCircleStack(graphic,color_machine,row,cell_index,cell_origin, radius){
    const def_color_value = row.default_colors[cell_index] / shape_properties.default_colors
    for(let i = cell_index; i >= 0; i--){
        let co = color_machine(def_color_value).rgba()
        co[3] = 255 * shape_properties.color_alpha_values[row.color_alpha_values[cell_index]]
        graphic.fill(co)
        graphic.rect(cell_origin.cx, cell_origin.cy, radius,radius)
        // graphic.circle(cell_origin.cx, cell_origin.cy, radius,radius)
    }
}


// triangles not updated to fit new modular data_grid_allocation
// also corners are kinda broken
export var DrawTriangle = (graphic,color_machine,row, cell) => {
    graphic.strokeWeight(0)
    const sub_dim = shape_properties.subshapes[row.subshapes[cell.index]];
    if(sub_dim === 1){
        let radius = shape_properties.shape_sizes[row.shape_sizes[cell.index]] * cell.width;
        drawTriangleStack(graphic,color_machine,row, cell.origin, cell, radius)
    }else{
        const sub_cell_width = cell.width / sub_dim;
        const sub_cell_height = cell.height / sub_dim;
        const color_value = row.default_color[cell.index] / shape_properties.default_colors
        const sub_color_value = row.subshapes_color[cell.index] / shape_properties.default_colors
        let index = 0;
        let cvs = [color_value];
        cvs.push(sub_color_value)
        for(let i = 2; i < sub_dim * sub_dim; i++)
            cvs.push(1 - cvs[i - 2])
        for(let x = 0; x < sub_dim; x++){
            for(let y = 0; y < sub_dim; y++){
                let sub_origin = {
                    x: cell.origin.x + x * sub_cell_width,
                    y: cell.origin.y + y * sub_cell_height,
                    cx: cell.origin.x + x * sub_cell_width + sub_cell_width / 2,
                    cy: cell.origin.y + y * sub_cell_height + sub_cell_height / 2,
                }
                let radius = shape_properties.subshape_sizes[row.subshape_sizes[cell.index]] * sub_cell_width;
                drawTriangleStack(graphic,color_machine,row,sub_origin,cell,radius)
                index += 1;
            }
        }
    }
 
}

function drawTriangleStack(graphic,color_machine,row, cell_origin, cell, radius){
    for(let i = cell.index; i >= 0; i--){
        let points = [
            {
                x: cell_origin.cx,
                y: cell_origin.cy,
            },
            {
                x: cell_origin.cx + radius,
                y: cell_origin.cy + radius
            },
            {
                x: cell_origin.cx - radius,
                y: cell_origin.cy + radius
            },
            {
                x: cell_origin.cx - radius,
                y: cell_origin.cy - radius
            },
        ]
        const color_value = row.default_color[cell.index] / shape_properties.default_colors
        // Array.from(new Set(row.rotations).values()).map((r_index,i) => {
            let r_index = 0;
            let co = color_machine(color_value).rgba()
            co[3] = 255 * shape_properties.color_alpha_values[row.color_alpha_values[cell.index]]
            graphic.fill(co)
            graphic.beginShape();
            let rotation_val = shape_properties.rotations[row.rotations[cell.index] + r_index]
            rotatePoints(points,cell.origin,rotation_val).map((p) => {
                graphic.vertex(p.x,p.y)
            })
            graphic.endShape();
        // })
    }
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
