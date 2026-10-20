const arr = [1, 2, 3, 4, 5, 6];

arr.splice(0);

console.log(arr);



// const maxPro = function (x){
//     return function (y){
//         console.log(x*y);
//         return x*y;
//     }
// }
// let ans = Number.MIN_SAFE_INTEGER;
// for (let i = 0; i < arr.length ; i++) {
//     for ( let j = i + 1; j <= arr.length; j++ ){
//         ans = Math.max(maxPro(i)(j), ans);
//     }
// };

// console.log("Answer = "+ans);