
export var shape_properties = {
  default_colors: 5,
  rotations:[0],
  shape_sizes:[1,1],
  subshapes:[1,2], //1x1, 2x2, 3x3
  subshape_sizes:[1,1],
  color_alpha_values: [1,1]
}

export var params = {
  canvas: {
    width: 2400,
    height:2400
  },

  images: [
    {
      grid: {
        width: 80,
        height: 80,
      },
      kernel: 'B',
      shape: 'rectangle',
      init_row: {
        mode: 'center', 
        group_size: 1,
        shift: 0,
      },
    },
  ],

  // image_id(s) coorspond to 
  // indicies of array above
  composite: {
    mode: 'merge', 
    merge: {
      image_ids: [0,1]
    },
    mask:{
      image_ids:[0,1],
      mask_id: 2
    },
    single:{
      image_id: 0
    }
  },

  draw:{
    mode:'fixed', // cycle
  },

  color:{
    palette: 'Spectral'
  },

}

export var wolfram_kernels = {
  'A': [
      [1,1,1]
  ],

  'B':[
      [1,0,1],
      [0,1,0],
      [1,0,1],
  ],

  'C':[
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,1,1,1,1]
  ],
}
