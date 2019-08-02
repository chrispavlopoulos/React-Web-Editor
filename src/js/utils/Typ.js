

class Typ{

  static saved = {};
  static MAX_MEMORY = 3;

  static for = (input, css, withMemory = false) =>{
    css = this.generify(css);
    var options = this.getOptionsFor(css);

    var memory = this.recall(css);

    if(options === "none") {
      if(memory && memory.length > 0){
        return input === ''? memory: ['clear'].concat(memory);
      }
      else
        return input === ''? []: ["clear"];
    }

    if(input === '') return this.uniqueConcat(memory, options);
    var pattern = new RegExp(input.replace(/([^a-z0-9]+)/gi, '-'));

    var suggestions = [];
    for(var i = 0; i < options.length; i++){
      var current = options[i];
      if(pattern.test(current) && input !== current)
        suggestions.push(current);
    }

    suggestions.unshift("clear");
    return suggestions;
  }

  //  'Save' a valid input value for a specific css property
  //  so users can reuse their favorite values
  static save = (input, css) =>{
    if(input === '' || !input || !css) return;

    //  If this is a default value, don't try saving it
    if(this.getOptionsFor(css).includes(input) || this.getDefault(css) === input) return;

    var memory = this.recall(css);

    if(memory.includes(input))
      return;

    if(memory.length >= this.MAX_MEMORY)
      memory.shift();
    memory.unshift(input);

    this.saved[this.generify(css)] = memory;
  }

  static recall = (css) =>{
    if(!css) return css;
    css = this.generify(css);

    var memory = this.saved[css];
    if(!memory) memory = [];

    return memory;
  }

  static complicate = (input, css) =>{
    if(input === '' || !input || !css) return '';
    css = this.generify(css);

    var regex = new RegExp(input.replace(/([^a-z0-9]+)/gi, '-'));

    switch (css.toLowerCase()){
      case "color":
        if(input === 'none' || input === 'no' || input === 'null')
          input = 'transparent';
        return input;
        break;
      case "number":
      case "scale":
        return input;
      case "densitynumber":
        return input//["12px", "24px", "32px", "5vmin", "5vmax",];
      case "rotation":
        return input//['45', '90', '180', '270'];
      case "textalign":
        return input//['left', 'center', 'right'];
      case "fontstyle":
        return input//['italic', 'oblique 10deg', 'oblique 20deg'];
      case "fontweight":
        return input//['bold', '100', '300','500', '900'];
      case "animation":
        var result, type, time, repeat, curve;

        if(input.includes('spin'))
          type = 'spin';
        else if(input.includes('grow')){
          type = 'grow';
          time = '3s';
        }

        if(!type) return input; // We at least need to know the type of animation

        var animationTime = /[0-9]{1,}s/; //Regex for 1 or more digits followed by an 's' for seconds
        if(animationTime.test(input))
          time = input.match(animationTime)[0];

        var digitsWithoutSeconds = /[0-9]{1,}[^s]/;
        repeat =
        input.includes('infinite') || input.includes('forever') || input.includes('constant')? 'infinite'
        //: digitsWithoutSeconds.test(input)? input.match(digitsWithoutSeconds)
        : input.includes('once')? '1'
        : input.includes('twice')? '2'
        : input.includes('thrice')? '3'
        : repeat;

        curve =
          input.includes('linear')? "linear"
          : input.includes('ease in out') || input.includes('ease out in')? 'ease-in-out'
          : input.includes('ease in')? 'ease-in'
          : input.includes('ease out')? 'ease-out'
          : curve;

        result = type;
        result += ' ' + (repeat? repeat: 'infinite');
        result += ' ' + (time? time: '20s');
        result += ' ' + (curve? curve: 'linear');

        return result;
      default:
        return input;
        break;
    }
  }

  static simplify = (input, css) =>{
    if(input === '' || !input || !css) return '';
    css = this.generify(css);

    switch (css.toLowerCase()){
      case "color":
        return input;
        break;
      case "number":
      case "scale":
        return input;
      case "densitynumber":
        return input;
      case "rotation":
        return input;
      case "textalign":
        return input;
      case "fontstyle":
        return input;
      case "fontweight":
        return input;
      case "animation":
        if(input.includes('spin'))
          return "spin";
      default:
        return input;
        break;
    }
  }

  static generify = (css) =>{
    switch (css.toLowerCase()){
      case "width":
      case "height":
        return "dimen";
      case "color":
      case "backgroundcolor":
      case "titlecolor":
      case "primarycolor":
      case "secondarycolor":
        return "color";
        break;
      case "text":
      case "textContent":
        return "text";
        break;
      case "number":
      case "zindex":
        return "number";
        break;
      case "densitynumber":
      case "fontsize":
        return "densitynumber";
      default:
        return css;
        break;
    }
  }

  static getDefault = (css) =>{
    css = this.generify(css);

    switch (css.toLowerCase()){
      case "color":
        return '';
        break;
      case "src":
        return 'https://image.flaticon.com/icons/svg/149/149092.svg';
      case "number":
      case 'rotation':
        return '0';
      case 'scale':
        return '1';
      case "densitynumber":
        return "4vmin";
      default:
        return '';
        break;
    }
  }

  static getOptionsFor = (css) =>{
    css = this.generify(css);

    switch (css.toLowerCase()){
      case "dimen":
        return ["auto", "100px", "500px", "20vmin", "20vmax",];
      case "color":
        return ["transparent", "black", "white", "red", "blue", "green", "yellow", "orange", "pink"];
        break;
      case "src":
        return ["http://localhost:3000/static/media/logo.5d5d9eef.svg"];
      case "number":
      case "scale":
        return ['1', '2', '5', '10', '1.5'];
      case "densitynumber":
        return ["12px", "24px", "32px", "3vmin", "5vmin", "3vmax", "5vmax",];
      case "rotation":
        return ['45', '90', '180', '270'];
      case "textalign":
        return ['left', 'center', 'right'];
      case "fontstyle":
        return ['italic', 'oblique 10deg', 'oblique 20deg'];
      case "fontweight":
        return ['bold', '100', '300','500', '900'];
      case "inputtype":
        return ['text', 'password', 'time'];
      default:
        return "none";
        break;
    }
  }

  static uniqueConcat = (arr1, arr2) =>{
    var i, j;
    var result = arr1.concat(arr2);
    for(i = 0; i < result.length; i++) {
        for(j = i + 1; j < result.length; j++) {
            if(result[i] === result[j])
              result.splice(j--, 1);
        }
    }

    return result;
  }

}

export default Typ
