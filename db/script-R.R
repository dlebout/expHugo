require(ggplot2)

***************************************** Graph ******************************************************

total <- global
total <- within(total, delta_speed <- edgeB_speed)
total <- subset(total, practice == "false")

cdata <- aggregate(total["delta_speed"], by=total[c("speed","visual_variable")], FUN=length)
names(cdata)[names(cdata)=="delta_speed"] <- "N"
cdata <- cdata[order(cdata$speed),]
cdata.means <- aggregate(total[c("edgeB_original_speed","edgeB_speed","delta_speed")], by = total[c("speed","visual_variable")], FUN=mean)
cdata <- merge(cdata, cdata.means)
cdata.sd <- aggregate(total["delta_speed"], by = total[c("speed","visual_variable")], FUN=sd)
names(cdata.sd)[names(cdata.sd)=="delta_speed"] <- "delta_speed.sd"
cdata <- merge(cdata, cdata.sd)
cdata$delta_speed.se <- cdata$delta_speed.sd / sqrt(cdata$N)

cdata$speed <- gsub("5.358", "Small speed", cdata$speed)
cdata$speed <- gsub("19.345200000000002", "Medium speed", cdata$speed)
cdata$speed <- gsub("36.755880000000005", "High speed", cdata$speed)

cdata$speed <- factor(cdata$speed, c("Small speed", "Medium speed", "High speed"))

p <- ggplot(data=cdata, aes(x=speed, y=delta_speed, fill=visual_variable)) +
     geom_dotplot(binaxis='y', stackdir='center', position=position_dodge(.5)) + 
     geom_errorbar(aes(ymin=delta_speed-delta_speed.sd, ymax=delta_speed+delta_speed.sd), width=.2, position=position_dodge(.5)) +
     scale_fill_brewer(palette="Reds") + 
     theme_minimal() +
     geom_hline(yintercept = 19.3452) +
     geom_hline(yintercept = 5.358) +
     geom_hline(yintercept = 36.75) + 
     labs(x="Target speed", y="Response speed",fill = "Visual variables") +
coord_cartesian(ylim = c(0, 52)) 
p

***************************************** ANOVA ******************************************************

total <- global
total <- within(total, delta_speed <- abs(edgeB_speed-edgeA_speed))
total <- subset(total, practice == "false")

cdata <- aggregate(total["delta_speed"], by=total[c("speed","visual_variable")], FUN=length)
names(cdata)[names(cdata)=="delta_speed"] <- "N"
cdata <- cdata[order(cdata$speed),]
cdata.means <- aggregate(total[c("edgeB_original_speed","edgeB_speed","delta_speed")], by = total[c("speed","visual_variable")], FUN=mean)
cdata <- merge(cdata, cdata.means)
cdata.sd <- aggregate(total["delta_speed"], by = total[c("speed","visual_variable")], FUN=sd)
names(cdata.sd)[names(cdata.sd)=="delta_speed"] <- "delta_speed.sd"
cdata <- merge(cdata, cdata.sd)
cdata$delta_speed.se <- cdata$delta_speed.sd / sqrt(cdata$N)

anov <- aov(delta_speed ~ speed + visual_variable + speed:visual_variable, data = total)
summary(anov)
