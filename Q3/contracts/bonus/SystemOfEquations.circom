pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    signal inter;

    // construct a matrix for the solution.
    component mul = matElemMul(n, n);
    for(var i = 0; i < n; i++) {
        for(var j = 0; j < n; j++) {
            mul.a[i][j] <== x[i];
            mul.b[i][j] <== A[i][j];
        }
    }

    component row[n];
    for(var i = 0; i < n; i++) {
        row[i] = matElemSum(1, n);

        for(var k = 0; k < n; k++) {
            row[i].a[0][k] <== mul.out[i][k];
        }
    }

    component equals[n];
    component sum = matElemSum(1, n);

    for(var i = 0; i < n; i++) {
        equals[i] = IsEqual();
        equals[i].in[0] <== row[i].out;
        equals[i].in[1] <== b[i];
        sum.a[0][i] <== equals[i].out;
    }

    out <== sum.out / n;
}

component main {public [A, b]} = SystemOfEquations(3);