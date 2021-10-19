function coloredBackground(element){
    const colors = [
        '#903471',
        '#903434',
        '#743490',
        '#3c3490',
        '#344590',
        '#345f90',
        '#34908e',
        '#349060',
        '#489034',
        '#8c9034',
        '#906a34',
        '#904334',
        '#0a0e58',
    ];
    const bg = element; //background to animate
    let counter = 0;
    const time = 650;
    setInterval(()=>{
        if(counter >= colors.length){
            counter = 0;
        }
        bg.style = `
            background-color: ${colors[counter]};
            transition: ${time * 2}ms;
        `;
        counter++;
    },time);
}