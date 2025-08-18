
import ballerina/http;
import ballerina/time;
import ballerina/log;


map<PeriodRequest> userPeriodData = {};
map<PeriodRequest[]> userPeriodHistory = {};

type PeriodRequest record {
    string lastPeriodStartDate;    
    int periodLength;              
    int averageCycleLength;        
};

type MonthInfo record {
    string month;                  
    int year;                     
    int daysInMonth;              
    boolean isLeapYear;           // Whether this year is a leap year
};


type PeriodPrediction record {
    int periodNumber;           
    string periodStartDate;       
    string periodEndDate;         
    string ovulationDate;         
    string fertileWindowStart;   
    string fertileWindowEnd;     
    int cycleDay;                
    MonthInfo monthInfo;         
};


type CalendarDay record {
    string date;                  
    string dayType;             
    int cycleDay;                
    string phase;                
    boolean isPredicted;         

};
type PeriodResponse record {
    boolean success;            
    string message;              
    PeriodPrediction[] predictions?;  
    CalendarDay[] calendarData?;     
    string nextPeriodDate?;      
    string nextOvulationDate?;   
};


@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
service /api/period on new http:Listener(8081) {
    

    resource function get health() returns json {
        log:printInfo("Period service health check - Pure Ballerina implementation");
        return {
            success: true,
            message: "Period prediction API running with pure Ballerina calculations",
            timestamp: time:utcToString(time:utcNow())
        };
    }

   
    resource function post predict(PeriodRequest request) returns PeriodResponse|error {
        log:printInfo("Generating period predictions with Ballerina for cycle length: " + request.averageCycleLength.toString());
        
        
        userPeriodData["default_user"] = request;
        
        
        PeriodRequest[]? existingHistory = userPeriodHistory["default_user"];
        if (existingHistory is PeriodRequest[]) {
            
            boolean exists = false;
            foreach var entry in existingHistory {
                if (entry.lastPeriodStartDate == request.lastPeriodStartDate) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                existingHistory.push(request);
            }
        } else {
            userPeriodHistory["default_user"] = [request];
        }
        
       
        string inputDate = request.lastPeriodStartDate + "T00:00:00Z";
        time:Utc|error lastPeriodStartResult = time:utcFromString(inputDate);
        if (lastPeriodStartResult is error) {
            return {
                success: false,
                message: "Invalid date format: " + lastPeriodStartResult.message()
            };
        }
        time:Utc lastPeriodStart = lastPeriodStartResult;
            
        // Generate predictions for next 6 cycles
        PeriodPrediction[] predictions = [];
        CalendarDay[] calendarData = [];
        
        int cycleLength = request.averageCycleLength;
        int periodLength = request.periodLength;
        
        
        foreach int i in 0...5 {
            time:Utc cycleStartTime = time:utcAddSeconds(lastPeriodStart, i * cycleLength * 24 * 3600);
            time:Utc cycleEndTime = time:utcAddSeconds(cycleStartTime, (periodLength - 1) * 24 * 3600);
            time:Utc ovulationTime = time:utcAddSeconds(cycleStartTime, (cycleLength - 14) * 24 * 3600);
            time:Utc fertileStart = time:utcAddSeconds(ovulationTime, -5 * 24 * 3600);
            time:Utc fertileEnd = time:utcAddSeconds(ovulationTime, 1 * 24 * 3600);
            
        
            time:Civil cycleCivil = time:utcToCivil(cycleStartTime);
            
            PeriodPrediction prediction = {
                periodNumber: i + 1,
                periodStartDate: time:utcToString(cycleStartTime).substring(0, 10),
                periodEndDate: time:utcToString(cycleEndTime).substring(0, 10),
                ovulationDate: time:utcToString(ovulationTime).substring(0, 10),
                fertileWindowStart: time:utcToString(fertileStart).substring(0, 10),
                fertileWindowEnd: time:utcToString(fertileEnd).substring(0, 10),
                cycleDay: 1,
                monthInfo: {
                    month: getMonthName(cycleCivil.month),
                    year: cycleCivil.year,
                    daysInMonth: getDaysInMonth(cycleCivil.month, cycleCivil.year),
                    isLeapYear: isLeapYear(cycleCivil.year)
                }
            };
            
            predictions.push(prediction);
        }
        
        
        calendarData = generateCalendarData(lastPeriodStart, cycleLength, periodLength);
        
        return {
            success: true,
            message: "Period predictions generated successfully",
            predictions: predictions,
            calendarData: calendarData,
            nextPeriodDate: predictions[1].periodStartDate,
            nextOvulationDate: predictions[1].ovulationDate
        };
    }

    // Get calendar data for a specific month
    resource function get calendar/[string year]/[string month]() returns PeriodResponse|error {
        log:printInfo("Getting calendar data for year: " + year + ", month: " + month);
        
        
        int yearInt = check int:fromString(year);
        int monthInt = check int:fromString(month);
        
        
        PeriodRequest[]? userHistory = userPeriodHistory["default_user"];
        
        CalendarDay[] monthCalendarData = [];
        
        if (userHistory is PeriodRequest[] && userHistory.length() > 0) {
            
            PeriodRequest? relevantPeriod = findRelevantPeriodForMonth(userHistory, yearInt, monthInt);
            
            if (relevantPeriod is PeriodRequest) {
                time:Utc lastPeriodStart = check time:utcFromString(relevantPeriod.lastPeriodStartDate + "T00:00:00Z");
                monthCalendarData = generateMonthCalendarData(lastPeriodStart, yearInt, monthInt, relevantPeriod.averageCycleLength, relevantPeriod.periodLength);
            } else {
                
                string samplePeriodDate = year + "-" + (monthInt < 10 ? "0" + monthInt.toString() : monthInt.toString()) + "-15";
                time:Utc sampleStartDate = check time:utcFromString(samplePeriodDate + "T00:00:00Z");
                monthCalendarData = generateMonthCalendarData(sampleStartDate, yearInt, monthInt, 28, 5);
            }
        } else {
            
            string samplePeriodDate = year + "-" + (monthInt < 10 ? "0" + monthInt.toString() : monthInt.toString()) + "-15";
            time:Utc sampleStartDate = check time:utcFromString(samplePeriodDate + "T00:00:00Z");
            monthCalendarData = generateMonthCalendarData(sampleStartDate, yearInt, monthInt, 28, 5);
        }
        
        return {
            success: true,
            message: "Calendar data retrieved for " + getMonthName(monthInt) + " " + year,
            calendarData: monthCalendarData
        };
    }
}

// Find the most relevant period data for a specific month
function findRelevantPeriodForMonth(PeriodRequest[] periodHistory, int year, int month) returns PeriodRequest? {
    
    time:Civil targetDate = {
        year: year,
        month: month,
        day: 15,
        hour: 0,
        minute: 0,
        second: 0
    };
    time:Utc|error targetUtcResult = time:utcFromCivil(targetDate);
    if (targetUtcResult is error) {
        return (); 
    }
    time:Utc targetUtc = targetUtcResult;
    
    PeriodRequest? closestPeriod = ();
    decimal minDiffSeconds = 999999999999d; 
    
    
    foreach var period in periodHistory {
        time:Utc|error periodUtcResult = time:utcFromString(period.lastPeriodStartDate + "T00:00:00Z");
        if (periodUtcResult is error) {
            continue; 
        }
        time:Utc periodUtc = periodUtcResult;
        
        
        decimal diffSeconds = time:utcDiffSeconds(targetUtc, periodUtc);
        if (diffSeconds < 0d) {
            diffSeconds = -diffSeconds;
        }
        
        
        decimal maxRelevantDiff = <decimal>(2 * period.averageCycleLength * 24 * 3600); 
        
        if (diffSeconds <= maxRelevantDiff && diffSeconds < minDiffSeconds) {
            minDiffSeconds = diffSeconds;
            closestPeriod = period;
        }
    }
    
    return closestPeriod;
}

// Helper function to get month name
function getMonthName(int month) returns string {
    match month {
        1 => { return "January"; }
        2 => { return "February"; }
        3 => { return "March"; }
        4 => { return "April"; }
        5 => { return "May"; }
        6 => { return "June"; }
        7 => { return "July"; }
        8 => { return "August"; }
        9 => { return "September"; }
        10 => { return "October"; }
        11 => { return "November"; }
        12 => { return "December"; }
        _ => { return "Unknown"; }
    }
}

// Helper function to check if year is leap year
function isLeapYear(int year) returns boolean {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

// Helper function to get days in month
function getDaysInMonth(int month, int year) returns int {
    match month {
        1|3|5|7|8|10|12 => { return 31; }
        4|6|9|11 => { return 30; }
        2 => { 
            if (isLeapYear(year)) {
                return 29;
            } else {
                return 28;
            }
        }
        _ => { return 30; }
    }
}

// Generate calendar data with period tracking
function generateCalendarData(time:Utc startDate, int cycleLength, int periodLength) returns CalendarDay[] {
    CalendarDay[] calendarData = [];
    
    // Generate data for next 90 days
    foreach int i in 0...89 {
        time:Utc currentDate = time:utcAddSeconds(startDate, i * 24 * 3600);
        string dateStr = time:utcToString(currentDate).substring(0, 10);
        
       
        int daysSinceStart = i;
        int cycleDay = (daysSinceStart % cycleLength) + 1;
        
        
        string dayType = "regular";
        string phase = "follicular";
        boolean isPredicted = i > 0; 
        
        if (cycleDay <= periodLength) {
            dayType = "period";
            phase = "menstrual";
        } else if (cycleDay == (cycleLength - 14)) {
            dayType = "ovulation";
            phase = "ovulation";
        } else if (cycleDay >= (cycleLength - 14 - 5) && cycleDay <= (cycleLength - 14 + 1)) {
            dayType = "fertile";
            phase = "ovulation";
        } else if (cycleDay > (cycleLength - 14)) {
            phase = "luteal";
        }
        
        CalendarDay calendarDay = {
            date: dateStr,
            dayType: dayType,
            cycleDay: cycleDay,
            phase: phase,
            isPredicted: isPredicted
        };
        
        calendarData.push(calendarDay);
    }
    
    return calendarData;
}

// Generate calendar data for a specific month only
function generateMonthCalendarData(time:Utc lastPeriodStart, int year, int month, int cycleLength, int periodLength) returns CalendarDay[] {
    CalendarDay[] calendarData = [];
    
    
    time:Civil monthStart = {
        year: year,
        month: month,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0
    };
    time:Utc|error monthStartResult = time:utcFromCivil(monthStart);
    if (monthStartResult is error) {
        return calendarData; 
    }
    time:Utc monthStartUtc = monthStartResult;
    
   
    int daysInMonth = getDaysInMonth(month, year);
    
    
    decimal diffSeconds = time:utcDiffSeconds(monthStartUtc, lastPeriodStart);
    int daysDiff = <int>(diffSeconds / (24 * 3600));
    
    
    foreach int day in 1...daysInMonth {
        time:Civil currentDay = {
            year: year,
            month: month,
            day: day,
            hour: 0,
            minute: 0,
            second: 0
        };
        time:Utc|error currentDayResult = time:utcFromCivil(currentDay);
        if (currentDayResult is error) {
            continue; 
        }
        time:Utc currentDayUtc = currentDayResult;
        string dateStr = time:utcToString(currentDayUtc).substring(0, 10);
        
        
        int daysSinceLastPeriod = daysDiff + (day - 1);
        int cycleDay = (daysSinceLastPeriod % cycleLength) + 1;
        if (cycleDay <= 0) {
            cycleDay = cycleLength + cycleDay;
        }
        
       
        string dayType = "regular";
        string phase = "follicular";
        boolean isPredicted = daysSinceLastPeriod > 0;
        
        if (cycleDay <= periodLength) {
            dayType = "period";
            phase = "menstrual";
        } else if (cycleDay == (cycleLength - 14)) {
            dayType = "ovulation";
            phase = "ovulation";
        } else if (cycleDay >= (cycleLength - 14 - 5) && cycleDay <= (cycleLength - 14 + 1)) {
            dayType = "fertile";
            phase = "ovulation";
        } else if (cycleDay > (cycleLength - 14)) {
            phase = "luteal";
        }
        
        CalendarDay calendarDay = {
            date: dateStr,
            dayType: dayType,
            cycleDay: cycleDay,
            phase: phase,
            isPredicted: isPredicted
        };
        
        calendarData.push(calendarDay);
    }
    
    return calendarData;
}
