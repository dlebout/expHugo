import json
import math
import csv
f = open("Distance.csv", 'wt')
writer = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
# writer.writerow( ('Path', 'File', 'Source', 'Target', 'Distance', 'Max', "Moyenne" ))
writer.writerow( ("VisualVariable","GroupCount", "GraphSize", 'Path','Distance', 'Max', "Moyenne" ))

GraphSize = ["High",  "Medium", "Low"]
GroupCount = ["Large", "Medium", "Small"]
VisualVariable = ["CrossingSpeedFrequency"]

number = 0
for visual_variable in VisualVariable:
    for group_count in GroupCount:
        for graph_size in GraphSize:
            path = visual_variable + '/' +group_count+ '/' + graph_size


            distance_value = []
            with open(path +'/data_expe_temporal.json') as data_file:
                data = json.load(data_file)

                nodes = {}
                for key in data["nodes"]:
                    print key
                    nodes[key["k"]] = {"Y":key["Y"], "X":key["X"]}

                iteration = 0;
                for key in data["links"]:
                    source = key["source"]
                    target = key["target"]
                    x1 = nodes[source]["X"]
                    y1 = nodes[source]["Y"]
                    x2 = nodes[target]["X"]
                    y2 = nodes[target]["Y"]

                    distance = math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 32.4
                    distance_value.append(distance)

                    print number, source, target ,distance

                    if (iteration == len(data["links"]) - 1):
                        mean = sum(distance_value) / float(len(distance_value))
                        # writer.writerow((path, number, source, target, distance, max(distance_value), mean))
                        writer.writerow((visual_variable ,group_count, graph_size,path, distance, max(distance_value), mean))
                    # else:
                    #     writer.writerow((path,number,source, target,distance, None, None))

                    iteration += 1
                number +=1


print 'FINISH WRITING'