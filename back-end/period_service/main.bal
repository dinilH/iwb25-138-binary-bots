import ballerina/http;
import ballerina/time;


type PeriodRequest  record{
    string lastPeriodStartDate;
    int periodLength;
    int averageCycleLength;
};

type MonthInfo record {
    string month;
    int year;
    int daysInMonth;
    boolean isLeapYear;
};

type PeriodPrediction record{
    int periodNumber;
    string periodStartDate;
    string periodEndDate;
    string ovulationDate;
    string fertileWindowStart;
    string fertileWindowEnd;
    int cycleDay;
    MonthInfo monthInfo;
};

service/period on new http:Listener(8080){
    resource function post predic(PeriodRequest request )returns json|error{
        string inputDate = request.lastPeriodStartDate + "T00:00:00Z";
        time:Utc lastPeriodStart = check time:utcFromString(inputDate);
        string formattedTime = time:utcToString(lastPeriodStart);
        //int daysToAdd = request.averageCycleLength;
       // int secondsToAdd= daysToAdd*24*60*60;
        //time:Utc newTime = lastPeriodStart + secondsToAdd;
        //time:Civil civil1= time:utcToCivil(lastPeriodStart);
        //time:Seconds duration={seconds:60};
        
        return {
           message: "Data received successfully",
            startDate: request.lastPeriodStartDate,
            periodLength: request.periodLength,
            cycleLength: request.averageCycleLength,
            date:lastPeriodStart,
            formatedDate:formattedTime
        };
    }
} 