input = "( n1 v n3 ) ^ ( 1 v 2 v n3 ) ^ ( n1 v 2 v n4 )"


def reg_seed(x, reg):
    regseed = []
    binary = "{0:b}".format(reg)
    numbits = len(binary)
    for i, bit in enumerate(binary):
        regseed.append('S reg' + bit + ' ' + str(x) + ' 0 ' + str(i - numbits))
    regseed.append('S regchk ' + str(x) + ' 0 ' + str(-1 - numbits))
    return regseed


tokens = input.split(' ')
numRegisters = 0
seed = []

currx = 1

for token in tokens:
    if token == '(':
        seed.append('S set0 ' + str(currx) + ' 0 1')
        seed.append('S setdef ' + str(currx) + ' 0 0')
        seed = seed + reg_seed(currx, 1)
        currx += 1

    elif token == ')':
        seed.append('S checkbit1 ' + str(currx) + ' 0 1')
        seed.append('S checkdef ' + str(currx) + ' 0 0')
        seed = seed + reg_seed(currx, 1)
        currx += 1

        seed.append('S checkdef2 ' + str(currx) + ' 0 0')
        currx += 1

    elif token == 'v' or token == '^':
        continue

    else:
        reg = 0
        if token[0] == 'n':
            reg = int(token[1:]) + 2
            if reg > numRegisters:
                numRegisters = reg

            seed.append('S inputdef ' + str(currx) + ' 0 0')
            seed = seed + reg_seed(currx, reg)
            currx += 1

            seed.append('S gatestart ' + str(currx) + ' 0 1')
            seed.append('S notdef ' + str(currx) + ' 0 0')
            currx += 1

            seed.append('S outdef ' + str(currx) + ' 0 0')
            seed = seed + reg_seed(currx, 2)
            currx += 1

            reg = 2

        if reg == 0:
            reg = int(token) + 2
            if reg > numRegisters:
                numRegisters = reg

        seed.append('S inputdef ' + str(currx) + ' 0 0')
        seed = seed + reg_seed(currx, 1)
        currx += 1

        seed.append('S inputdef ' + str(currx) + ' 0 0')
        seed = seed + reg_seed(currx, reg)
        currx += 1

        seed.append('S ordef ' + str(currx) + ' 0 0')
        seed.append('S gatestart ' + str(currx) + ' 0 1')
        currx += 1

        seed.append('S outdef ' + str(currx) + ' 0 0')
        seed = seed + reg_seed(currx, 1)
        currx += 1

seed.append('S enddef ' + str(currx) + ' 0 0')

seed.append('S argdef 0 0 0')
seed = seed + reg_seed(0, numRegisters)

print('\n'.join(seed))
