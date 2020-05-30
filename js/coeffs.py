from sympy import hermite, Poly
from sympy.abc import x

f = open("coefs.txt", "a")
maxN = 100
for n in range(maxN+1):
  if(n==0):
    f.write("[")
  listAsString = ', '.join(map(str, Poly(hermite(n, x), x).coeffs()[::-1]))
  f.write("["+listAsString+"]")
  if(n!=maxN):
    f.write(",\n")
  else:
    f.write("]")
f.close()