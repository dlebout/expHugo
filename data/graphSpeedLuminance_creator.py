import json
import matplotlib.pyplot as plt
import os
import math
import random


# speed = [1,2,4,6,10,20]
# speed = [1, 1.49, 2.533, 4.31, 7.33, 12.45]
# speed = [1.2,2,3.4,5.8,9.86,16.762]
# speed = [1, 1.7, 2.89, 4.913, 8.35, 14.2]


#JND 0.8
# speed = [1, 1.8, 3.24, 5.832, 10.5, 18.9]

#JND 0.9
speed = [1, 1.9, 3.61, 6.86, 13.034, 24.8]
speedUS = [0.2, 1, 1.9, 3.61, 6.86, 13.034, 24.8, 50]
speedDefault = [3.61]

frequency = [0.3, 0.45, 0.675, 1.0125, 1.518, 2.277]
#frequency = [2.277, 1.518, 1.0125, 0.675, 0.45, 0.3]
frequencyDefault = [1.0125]

pattern = [3,6,9,12,15,18]
patternDefault = [0.0]

height = [2,5,8,11,14,17]
heightDefault = [5]


#                           85%        74%      59%        45%      32%         15%
luminance_achromatic = ["#d9d9d9","#bdbdbd","#969696","#737373","#525252", "#252525"]

def saveGraph(d, path, name):
    try:
        os.makedirs(path)
    except OSError:
        pass
    #print path
    json.dump(d, open(path + name,'w'))
def saveEdges(d, path, name):
    try:
        os.makedirs(path)
    except OSError:
        pass
    json.dump(d, open(path + name,'w'))

def extractSubArray(array, numbersToExtract):
    copy = list(array)
    sub = []
    for i in range(0, numbersToExtract):
        random.shuffle(copy)
        sub.append(copy[0])
        del copy[0]
    return sub
def shuffleAndDifferent(array, limit):
    if limit > 10:
        return
    copy = list(array)
    diff = False
    random.shuffle(array)
    for i in range(0, len(array)):
        if array[i] != copy[i] :
            diff = True
    if not diff :
        shuffleAndDifferent(array, limit+1)

def crossMotion(speedA, freqA, colorA, sizeA):
    res = []
    for s in speedA:
        for f in freqA:
            for c in colorA:
                for si in sizeA:
                    res.append([s,f,c,si])
    return res

def firstPart():
    graphCreation(speed,frequencyDefault,luminance_achromatic,patternDefault, "./edges_layout")
    edgesCreationJND( speed, luminance_achromatic, "./edges_layout", '/edgesJND-luminant.json' )
    #edgesCreationUS(group, speedUS, luminance_achromatic, "./speed_luminance_achromatic")



def graphCreation(speedA,frequencyA,colorA,sizeA, path):
    for indexA in range(1,9):
        res = crossMotion( speedA, frequencyA, colorA, sizeA)
        for indexB in range(1,4):
            dataLayoutFixed = 0
            with open("edges_layout/graph" + str(indexA) + "_" + str(indexB) + ".json" ) as data_file:
                print "edges_layout/graph" + str(indexA) + "_" + str(indexB) + ".json"
                dataLayoutFixed = json.load(data_file)
            iteration = 0
            dataLayoutFixed["links"][iteration]["id"]
            for n in range(0,len(dataLayoutFixed["links"])):
                if ( iteration%len(res) == 0):
                    shuffleAndDifferent(res, 0)
                dataLayoutFixed["links"][iteration]["frequency"] = res[iteration%len(res)][1]
                dataLayoutFixed["links"][iteration]["speed"] = res[iteration%len(res)][0]
                dataLayoutFixed["links"][iteration]["color"] = res[iteration%len(res)][2]
                dataLayoutFixed["links"][iteration]["pattern"] = res[iteration%len(res)][3]
                dataLayoutFixed["links"][iteration]["spacing"] = "30"
                iteration += 1
            saveGraph(dataLayoutFixed,path, "/graph" + str(indexA) + "_" + str(indexB) + ".json")

    #{"sizeParticule": "10", "target": 27, "OLDSOURCE": 12, "color": "black", "temporal": [0.0], "OLDTARGET": 42, "source": 1, "shape": "rectangle", "frequency": 0.25, "speed": 1, "id": 40}
    #print (speedArray, temporalArray, frequencyArray, colorArray, sizeArray, shapeArray)
def createGroupArray():
    group = []
    for i in range(1,9):
        jrange = []
        if ( i == 1):
            jrange = [5]
        if ( i == 2):
            jrange = [6]
        if ( i == 3):
            jrange = [7]
        if ( i == 4):
            jrange = [8]
        if ( i == 5):
            jrange = [1]
        if ( i == 6):
            jrange = [2]
        if ( i == 7):
            jrange = [3]
        if ( i == 8):
            jrange = [4]
        for j in jrange:
            xrange = []
            if ( i == 1):
                xrange = [8,1,2,3]
            if ( i == 2):
                xrange = [1,2,3,4]
            if ( i == 3):
                xrange = [2,3,4,5]
            if ( i == 4):
                xrange = [3,4,5,6]
            if ( i == 5):
                xrange = [4,5,6,7]
            if ( i == 6):
                xrange = [5,6,7,8]
            if ( i == 7):
                xrange = [6,7,8,1]
            if ( i == 8):
                xrange = [7,8,1,2]
            for x in xrange:
                zrange = []
                if ( j == 1):
                    zrange = [8,1,2,3]
                if ( j == 2):
                    zrange = [1,2,3,4]
                if ( j == 3):
                    zrange = [2,3,4,5]
                if ( j == 4):
                    zrange = [3,4,5,6]
                if ( j == 5):
                    zrange = [4,5,6,7]
                if ( j == 6):
                    zrange = [5,6,7,8]
                if ( j == 7):
                    zrange = [6,7,8,1]
                if ( j == 8):
                    zrange = [7,8,1,2]
                for z in zrange:
                    inter = {}
                    inter['idRef'] = str(i) + str(x)
                    inter['idTar'] = str(j) + str(z)
                    if ( math.fabs(z-x) == 4 ):
                        inter['angle'] = "180"
                    elif ( math.fabs(z-x) == 3 or math.fabs(z-x) == 5 ):
                        inter['angle'] = "135"
                    elif ( math.fabs(z-x) == 2 or math.fabs(z-x) == 6 ):
                        inter['angle'] = "90"
                    elif ( math.fabs(z-x) == 1 or math.fabs(z-x) == 7 ):
                        inter['angle'] = "45"
                    group.append(inter)
    shuffleAndDifferent(group,0)
    return group

def edgesCreationJND(speed, color, path, name):
    graphName = []
    for indexA in range(1,9):
        for indexB in range(1,4):
            graphName.append("/graph" + str(indexA) + "_" + str(indexB) + ".json")
    shuffleAndDifferent(graphName,0)
    shuffleAndDifferent(graphName,0)
    shuffleAndDifferent(graphName,0)

    templateEdge = {}
    iteration = 1
    for complexity in ["replication1"]:
        for value1 in ['1.9','6.86','13.034']:
            templateEdge[value1] = {}
            for value2 in ['increase', 'decrease']:
                templateEdge[value1][value2] = {}
                for value3 in ['0','11','40','70']:
                    iteration += 1
                    templateEdge[value1][value2][value3]= {}
                    for value4 in ['reference']:
                        templateEdge[value1][value2][value3] = {}

                        ref = {}
                        tar = {}

                        if ( value1 == '1.9'):
                            if (value2 == 'increase'):
                                ref['speed'] = 1.9
                                tar['speed'] = 0.55
                            elif ( value2 == 'decrease'):
                                ref['speed'] = 1.9
                                tar['speed'] = 3.61
                        elif ( value1 == '6.86'):
                            if (value2 == 'increase'):
                                ref['speed'] = 6.86
                                tar['speed'] = 3.61
                            elif ( value2 == 'decrease'):
                                ref['speed'] = 6.86
                                tar['speed'] = 13.034
                        elif ( value1 == '13.034'):
                            if (value2 == 'increase'):
                                ref['speed'] = 13.034
                                tar['speed'] = 6.86
                            elif ( value2 == 'decrease'):
                                ref['speed'] = 13.034
                                tar['speed'] = 24.8

                        if ( value3 == '0'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[5]
                            elif ( value4 == 'target'):
                                ref['color'] = color[2]
                                tar['color'] = color[0]
                        elif ( value3 == '11'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[4]
                            elif ( value4 == 'target'):
                                ref['color'] = color[3]
                                tar['color'] = color[5]
                        elif ( value3 == '40'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[2]
                            elif ( value4 == 'target'):
                                ref['color'] = color[1]
                                tar['color'] = color[4]
                        elif ( value3 == '70'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[0]
                            elif ( value4 == 'target'):
                                ref['color'] = color[1]
                                tar['color'] = color[0]

                        if ( iteration%24 == 0):
                            shuffleAndDifferent(graphName,0)
                            shuffleAndDifferent(graphName,0)
                            shuffleAndDifferent(graphName,0)
                        templateEdge[value1][value2][value3]["reference"] = ref
                        templateEdge[value1][value2][value3]["target"] = tar
                        templateEdge[value1][value2][value3]["graph"] = graphName[iteration%24]

    saveEdges(templateEdge, path, name)

firstPart()
