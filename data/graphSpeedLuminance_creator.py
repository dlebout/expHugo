import json
import networkx as nx
import matplotlib.pyplot as plt
import os
import math
from networkx.readwrite import json_graph
from networkx.drawing.nx_agraph import graphviz_layout
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

#colorBlue = ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"]
#colorRed = ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"]
#colorGreen = ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"]
#colorBlue = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
#colorBlue = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
#colorGreen = ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
#colorRed = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
luminance_achromatic = ["#d9d9d9","#bdbdbd","#969696","#737373","#525252", "#252525"]
colorDefault = ["black"]

remove = [[],[4,7],[8,5],[1,6],[2,7],[3,8],[1,4],[2,5],[3,6]]

# speed = [1.2,2.2,4,7.2,13,23.4]

def saveGraph(d, path):
    try:
        os.makedirs(path)
    except OSError:
        pass
    #print path
    json.dump(d, open(path + '/graph.json','w'))
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

def chooseLowJND(array):
    return ([array[1],array[0]],[array[1],array[1]],[array[1],array[2]])
def chooseMediumJND(array):
    return ([array[3],array[1]],[array[2],array[2]],[array[2],array[4]])
def chooseHighJND(array):
    return ([array[5],array[3]],[array[4],array[4]],[array[4],array[5]])

def extractRandom(start,end):
    print start,end
    return random.uniform(start, end)

def chooseRandomPrimary(array, res, tag1):
    for i in range(0,18):
        res.append([array[1], extractRandom(array[0]-(math.fabs(array[0]-array[1])/2),array[0]), tag1, "lower"])
    for i in range(0,18):
        res.append([array[1], extractRandom(array[1], array[2]+(math.fabs(array[1]+array[2])/2)), tag1, "higher"])
    return res

def chooseRandomSecondaryClose9(arr):
    return [[arr[1],arr[0], "low", "lower"],[arr[1],arr[1], "low", "same"],[arr[1],arr[2], "low", "higher"], \
    [arr[4],arr[3], "medium", "lower"],[arr[4],arr[4], "medium", "same"],[arr[4],arr[5], "medium", "higher"], \
    [arr[7],arr[6], "high", "lower"],[arr[7],arr[7], "high", "same"],[arr[7],arr[8], "high", "higher"]]

def chooseRandomSecondaryClose6(arr):
    return [[arr[1],arr[0], "low", "lower"],[arr[1],arr[1], "low", "same"],[arr[1],arr[2], "low", "higher"], \
    [arr[3],arr[2], "medium", "lower"],[arr[3],arr[3], "medium", "same"],[arr[3],arr[4], "medium", "higher"], \
    [arr[4],arr[3], "high", "lower"],[arr[4],arr[4], "high", "same"],[arr[4],arr[5], "high", "higher"]]

def crossMotion(speedA, freqA, colorA, sizeA):
    res = []
    for s in speedA:
        for f in freqA:
            for c in colorA:
                for si in sizeA:
                    res.append([s,f,c,si])
    return res

def createGraphIdentity(templateGraph):
    with open("graph_layout/graph.json" ) as data_file:
        print 'sucess layout'
        dataLayoutFixed = json.load(data_file)
        return dataLayoutFixed

def firstPart():
    G = createGraphIdentity(1)
    graphCreation(G, speed,frequencyDefault,luminance_achromatic,patternDefault, "./speed_luminance_achromatic")
    edgesCreationJND(G, speed, luminance_achromatic, "./speed_luminance_achromatic")
    edgesCreationUS(G, speedUS, luminance_achromatic, "./speed_luminance_achromatic")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speed,frequencyDefault,colorBlue,patternDefault, "../data/Speed_LightnessBlue")
    #edgesCreation(G,edgesLayoutFixed, speed, "speed", colorBlue, "color", frequencyDefault[0], "frequency", patternDefault[0], "pattern", "../data/Speed_LightnessBlue")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed,speed,frequencyDefault,colorGreen,patternDefault, "../data/Speed_LightnessGreen")
    #edgesCreation(G,edgesLayoutFixed, speed, "speed", colorGreen, "color", frequencyDefault[0], "frequency", patternDefault[0], "pattern", "../data/Speed_LightnessGreen")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed,speed,frequencyDefault,colorRed,patternDefault, "../data/Speed_LightnessRed")
    #edgesCreation(G,edgesLayoutFixed, speed, "speed", colorRed, "color", frequencyDefault[0], "frequency", patternDefault[0], "pattern", "../data/Speed_LightnessRed")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speed,frequencyDefault,colorDefault,pattern, "../data/Speed_Size")
    #edgesCreation(G,edgesLayoutFixed, speed, "speed", pattern, "pattern", colorDefault[0], "color", frequencyDefault[0], "frequency" ,"../data/Speed_Size")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speedDefault,frequency,colorBlue,patternDefault, "../data/Frequency_LightnessBlue")
    #edgesCreation(G,edgesLayoutFixed, frequency,"frequency", colorBlue, "color", speedDefault[0], "speed", patternDefault[0], "pattern", "../data/Frequency_LightnessBlue")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speedDefault,frequency,colorGreen,patternDefault, "../data/Frequency_LightnessGreen")
    #edgesCreation(G,edgesLayoutFixed, frequency,"frequency", colorGreen, "color", speedDefault[0], "speed", patternDefault[0], "pattern", "../data/Frequency_LightnessGreen")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speedDefault,frequency,colorRed,patternDefault, "../data/Frequency_LightnessRed")
    #edgesCreation(G,edgesLayoutFixed, frequency,"frequency", colorRed, "color", speedDefault[0], "speed", patternDefault[0], "pattern", "../data/Frequency_LightnessRed")

    #G,edgesLayoutFixed = createGraphIdentity(1)
    #graphCreation(G,edgesLayoutFixed, speedDefault,frequency,colorDefault,pattern, "../data/Frequency_Size")
    #edgesCreation(G,edgesLayoutFixed, frequency,"frequency",pattern, "pattern",speedDefault[0],"speed", colorDefault[0], "color", "../data/Frequency_Size")


def graphCreation(dataLayoutFixed,speedA,frequencyA,colorA,sizeA, path):
    res = crossMotion( speedA, frequencyA, colorA, sizeA)

    iteration = 0
    dataLayoutFixed["links"][iteration]["id"]
    for n in range(0,len(dataLayoutFixed["links"])):
        print dataLayoutFixed["links"][iteration]["id"]
        if ( iteration%len(res) == 0):
            shuffleAndDifferent(res, 0)
        dataLayoutFixed["links"][iteration]["frequency"] = res[iteration%len(res)][1]
        dataLayoutFixed["links"][iteration]["speed"] = res[iteration%len(res)][0]
        dataLayoutFixed["links"][iteration]["color"] = res[iteration%len(res)][2]
        dataLayoutFixed["links"][iteration]["pattern"] = res[iteration%len(res)][3]
        dataLayoutFixed["links"][iteration]["spacing"] = "30"
        iteration += 1

    saveGraph(dataLayoutFixed,path)

    #{"sizeParticule": "10", "target": 27, "OLDSOURCE": 12, "color": "black", "temporal": [0.0], "OLDTARGET": 42, "source": 1, "shape": "rectangle", "frequency": 0.25, "speed": 1, "id": 40}
    #print (speedArray, temporalArray, frequencyArray, colorArray, sizeArray, shapeArray)

def createDirectionArray():
    direction = []
    for i in range(0,168):
        direction.append('same')
    for i in range(0,168):
        direction.append('opposed')
    shuffleAndDifferent(direction,0)
    return direction

def createGroupArray():
    group = []
    for i in range(1,9):
        jrange = []
        if ( i == 1):
            jrange = [4,5,6]
        if ( i == 2):
            jrange = [5,6,7]
        if ( i == 3):
            jrange = [6,7,8]
        if ( i == 4):
            jrange = [7,8,1]
        if ( i == 5):
            jrange = [8,1,2]
        if ( i == 6):
            jrange = [1,2,3]
        if ( i == 7):
            jrange = [2,3,4]
        if ( i == 8):
            jrange = [3,4,5]
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

def edgesCreationUS(dataLayoutFixed, speed, color, path):
    direction = createDirectionArray()
    group = createGroupArray()
    templateEdge = {}
    iteration = 0
    for complexity in ["near","far"]:
        templateEdge[complexity] = {}
        for value1 in ['1','2','3','4','5','6']:
            templateEdge[complexity][value1] = {}
            for value2 in ['inferior', 'superior']:
                templateEdge[complexity][value1][value2] = {}
                for value3 in ['0-0','0-1','0-3','0-5','5-5','5-4','5-2']:
                    templateEdge[complexity][value1][value2][value3]= {}
                    for value4 in ['reference','target']:
                        templateEdge[complexity][value1][value2][value3][value4] = {}

                        ref = {}
                        tar = {}

                        ref['id'] = group[iteration]["idRef"]
                        tar['id'] = group[iteration]["idTar"]

                        if ( value1 == '1'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[1]
                                tar['speed'] = speed[0]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[1]
                                tar['speed'] = speed[2]
                        elif ( value1 == '2'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[2]
                                tar['speed'] = speed[1]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[2]
                                tar['speed'] = speed[3]
                        elif ( value1 == '3'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[3]
                                tar['speed'] = speed[2]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[3]
                                tar['speed'] = speed[4]
                        elif ( value1 == '4'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[4]
                                tar['speed'] = speed[3]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[4]
                                tar['speed'] = speed[5]
                        elif ( value1 == '5'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[5]
                                tar['speed'] = speed[4]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[5]
                                tar['speed'] = speed[6]
                        elif ( value1 == '6'):
                            if ( value2 == 'inferior'):
                                ref['speed'] = speed[6]
                                tar['speed'] = speed[5]
                            elif ( value2 == 'superior'):
                                ref['speed'] = speed[6]
                                tar['speed'] = speed[7]

                        if ( value3 == '0-0'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[0]
                                tar['color'] = color[0]
                            elif ( value4 == 'target'):
                                ref['color'] = color[0]
                                tar['color'] = color[0]
                        elif ( value3 == '0-1'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[0]
                                tar['color'] = color[1]
                            elif ( value4 == 'target'):
                                ref['color'] = color[1]
                                tar['color'] = color[0]
                        elif ( value3 == '0-3'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[0]
                                tar['color'] = color[3]
                            elif ( value4 == 'target'):
                                ref['color'] = color[3]
                                tar['color'] = color[0]
                        elif ( value3 == '0-5'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[0]
                                tar['color'] = color[5]
                            elif ( value4 == 'target'):
                                ref['color'] = color[5]
                                tar['color'] = color[0]
                        elif ( value3 == '5-5'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[5]
                            elif ( value4 == 'target'):
                                ref['color'] = color[5]
                                tar['color'] = color[5]
                        elif ( value3 == '5-4'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[4]
                            elif ( value4 == 'target'):
                                ref['color'] = color[4]
                                tar['color'] = color[5]
                        elif ( value3 == '5-2'):
                            if ( value4 == 'reference'):
                                ref['color'] = color[5]
                                tar['color'] = color[2]
                            elif ( value4 == 'target'):
                                ref['color'] = color[2]
                                tar['color'] = color[5]


                        templateEdge[complexity][value1][value2][value3][value4]["reference"] = ref
                        templateEdge[complexity][value1][value2][value3][value4]["target"] = tar

                        iteration += 1
    saveEdges(templateEdge, path, '/edgesUS.json')

def edgesCreationJND(dataLayoutFixed, speed, color, path):
    templateEdge = {}
    for complexity in ["near","far"]:
        templateEdge[complexity] = {}
        for value1 in ['low1','low2','medium1','medium2', 'high1', 'high2']:
            templateEdge[complexity][value1] = {}
            for value2 in ['increase', 'decrease']:
                templateEdge[complexity][value1][value2] = {}
                for value3 in ['low-0','low-1','low-3','low-5','high-0','high-1','high-3','high-5']:
                    templateEdge[complexity][value1][value2][value3]= {}
                    for value4 in ['replication1', 'replication2']:
                        templateEdge[complexity][value1][value2][value3][value4] = {}

                        ref = {}
                        tar = {}

                        ref['id'] = 1
                        tar['id'] = 5
                        if ( value1 == 'low1'):
                            ref['speed'] = speed[0]
                            tar['speed'] = speed[0]
                        elif ( value1 == 'low2'):
                            ref['speed'] = speed[1]
                            tar['speed'] = speed[1]
                        elif ( value1 == 'medium1'):
                            ref['speed'] = speed[2]
                            tar['speed'] = speed[2]
                        elif ( value1 == 'medium2'):
                            ref['speed'] = speed[3]
                            tar['speed'] = speed[3]
                        elif ( value1 == 'high1'):
                            ref['speed'] = speed[4]
                            tar['speed'] = speed[4]
                        elif ( value1 == 'high2'):
                            ref['speed'] = speed[5]
                            tar['speed'] = speed[5]

                        if ( value1 == 'low-0'):
                            ref['color'] = color[0]
                            tar['color'] = color[0]
                        elif ( value1 == 'low-1'):
                            ref['color'] = color[0]
                            tar['color'] = color[1]
                        elif ( value1 == 'low-3'):
                            ref['color'] = color[0]
                            tar['color'] = color[3]
                        elif ( value1 == 'low-5'):
                            ref['color'] = color[0]
                            tar['color'] = color[5]
                        elif ( value1 == 'high-0'):
                            ref['color'] = color[5]
                            tar['color'] = color[5]
                        elif ( value1 == 'high-1'):
                            ref['color'] = color[5]
                            tar['color'] = color[4]
                        elif ( value1 == 'high-3'):
                            ref['color'] = color[5]
                            tar['color'] = color[2]
                        elif ( value1 == 'high-5'):
                            ref['color'] = color[5]
                            tar['color'] = color[0]

                        templateEdge[complexity][value1][value2][value3][value4]["reference"] = ref
                        templateEdge[complexity][value1][value2][value3][value4]["target"] = tar

    saveEdges(templateEdge, path, '/edgesJND.json')

firstPart()
