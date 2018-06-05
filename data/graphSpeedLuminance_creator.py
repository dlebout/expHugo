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

width = [[12],[21],[36.75],[55.125]]
widthDefault = [[12]]

height = [4, 6.5, 11, 17]
heightDefault = [4]

chroma = ["#008aff","#957400","#009b74","#ff007d"]
chroma = ["#00caff","#e0b500","#ff00be","#00e6b6"]

#                           85%        74%      59%        45%      32%         15%
#luminance_achromatic = ["#d9d9d9","#bdbdbd","#969696","#737373","#525252", "#252525"]

#                          100%        66.6%    33.3%     0%
#luminance_achromatic = ["#b900ff","#00a9ff","#009800", "#f00"]
luminance_achromatic = ["#ffffff","#a2a2a2","#4e4e4e", "#000000"]
#luminance_achromatic = ["#c7c7c7","#949494","#616161","#616161","#2e2e2e", "#2e2e2e"]
colorDefault = ["#000000"]

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
    graphCreation(speed, widthDefault, luminance_achromatic, heightDefault, "./edges_layout_lumi")
    edgesCreationJND(speed, luminance_achromatic, "./edges_layout_lumi", '/edgesJND-luminant.json', "color" )

    graphCreation(speed,width,colorDefault,heightDefault, "./edges_layout_width")
    edgesCreationJND( speed, width, "./edges_layout_width", '/edgesJND-luminant.json', "other" )

    graphCreation(speed,widthDefault,colorDefault,height, "./edges_layout_height")
    edgesCreationJND( speed, height, "./edges_layout_height", '/edgesJND-luminant.json', "other" )

    graphCreation(speed, widthDefault, chroma, heightDefault, "./edges_layout_chroma")
    edgesCreationJND(speed, luminance_achromatic, "./edges_layout_chroma", '/edgesJND-luminant.json', "other" )
    #edgesCreationUS(group, speedUS, luminance_achromatic, "./speed_luminance_achromatic")



def graphCreation(speedA,frequencyA,colorA,sizeA, path):
    for indexA in range(1,9):
        res = crossMotion( speedA, frequencyA, colorA, sizeA)
        for indexB in range(1,4):
            dataLayoutFixed = 0
            with open("graph_layout/graph" + str(indexA) + ".json" ) as data_file:
                dataLayoutFixed = json.load(data_file)

            iteration = 0
            dataLayoutFixed["links"][iteration]["id"]

            for n in range(0,len(dataLayoutFixed["links"])):
                if ( iteration%len(res) == 0):
                    shuffleAndDifferent(res, 0)
                dataLayoutFixed["links"][iteration]["pattern"] = res[iteration%len(res)][1]
                dataLayoutFixed["links"][iteration]["speed"] = res[iteration%len(res)][0]
                dataLayoutFixed["links"][iteration]["color"] = res[iteration%len(res)][2]
                dataLayoutFixed["links"][iteration]["height"] = res[iteration%len(res)][3]
                dataLayoutFixed["links"][iteration]["spacing"] = "30"
                iteration += 1
                dataLayoutFixed["reference"] = dataLayoutFixed["pos"][indexB-1]["reference"]
                dataLayoutFixed["target"] = dataLayoutFixed["pos"][indexB-1]["target"]
            saveGraph(dataLayoutFixed,path, "/graph" + str(indexA) + "_" + str(indexB) + ".json")

    #{"sizeParticule": "10", "target": 27, "OLDSOURCE": 12, "color": "black", "temporal": [0.0], "OLDTARGET": 42, "source": 1, "shape": "rectangle", "frequency": 0.25, "speed": 1, "id": 40}
    #print (speedArray, temporalArray, frequencyArray, colorArray, sizeArray, shapeArray)

def edgesCreationJND(speed, color, path, name, mode):
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
                            if ( mode == 'color'):
                                ref['color'] = color[3]
                                tar['color'] = color[3]
                            elif ( mode == 'other'):
                                ref['color'] = color[0]
                                tar['color'] = color[0]
                        elif ( value3 == '11'):
                            if ( mode == 'color'):
                                ref['color'] = color[3]
                                tar['color'] = color[2]
                            elif ( mode == 'other'):
                                ref['color'] = color[0]
                                tar['color'] = color[1]
                        elif ( value3 == '40'):
                            if ( mode == 'color'):
                                ref['color'] = color[3]
                                tar['color'] = color[1]
                            elif ( mode == 'other'):
                                ref['color'] = color[0]
                                tar['color'] = color[2]
                        elif ( value3 == '70'):
                            if ( mode == 'color'):
                                ref['color'] = color[3]
                                tar['color'] = color[0]
                            elif ( mode == 'other'):
                                ref['color'] = color[0]
                                tar['color'] = color[3]

                        if ( iteration%24 == 0):
                            shuffleAndDifferent(graphName,0)
                            shuffleAndDifferent(graphName,0)
                            shuffleAndDifferent(graphName,0)
                        templateEdge[value1][value2][value3]["reference"] = ref
                        templateEdge[value1][value2][value3]["target"] = tar
                        templateEdge[value1][value2][value3]["graph"] = graphName[iteration%24]

    saveEdges(templateEdge, path, name)

firstPart()
