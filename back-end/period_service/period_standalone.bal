import ballerina/http;
import ballerina/time;
import ballerina/log;

type PeriodRequest record {
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
    string dayType; // "period", "ovulation", "fertile", "regular"
    int cycleDay;
    string phase; // "menstrual", "follicular", "ovulation", "luteal"
    boolean isPredicted;
};

type PeriodResponse record {
    boolean success;
    string message;
    PeriodPrediction[]? predictions?;
    CalendarDay[]? calendarData?;
    string? nextPeriodDate?;
    string? nextOvulationDate?;
    string? timestamp?;
};

// CORS configuration
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: false,
        allowHeaders: ["CORELATION_ID", "Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
service /period\-service on new http:Listener(9093) {

    // Health check endpoint
    resource function get health() returns json {
        log:printInfo("Health check requested");
        return {
            status: "UP",
            service: "Period Prediction Service",
            timestamp: time:utcToString(time:utcNow())
        };
    }

    // Predict future periods
    resource function post predict(PeriodRequest request) returns PeriodResponse|error {
        log:printInfo("Predicting periods for cycle length: " + request.averageCycleLength.toString());
        
        // Parse the input date
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
        
        // Generate predictions for next 6 months
        foreach int i in 0...5 {
            time:Utc cycleStartTime = time:utcAddSeconds(lastPeriodStart, i * cycleLength * 24 * 3600);
            time:Utc cycleEndTime = time:utcAddSeconds(cycleStartTime, (periodLength - 1) * 24 * 3600);
            time:Utc ovulationTime = time:utcAddSeconds(cycleStartTime, (cycleLength - 14) * 24 * 3600);
            time:Utc fertileStart = time:utcAddSeconds(ovulationTime, -5 * 24 * 3600);
            time:Utc fertileEnd = time:utcAddSeconds(ovulationTime, 1 * 24 * 3600);
            
            // Convert to civil time for month info
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
        
        // Generate calendar data for the next 3 months
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
    resource function get calendar(string year, string month) returns PeriodResponse|error {
        // This would typically get user's period data from database
        // For now, return sample calendar data
        return {
            success: true,
            message: "Calendar data retrieved",
            calendarData: []
        };
    }
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
    
    // Generate data for next 90 days (3 months)
    foreach int i in 0...89 {
        time:Utc currentDate = time:utcAddSeconds(startDate, i * 24 * 3600);
        string dateStr = time:utcToString(currentDate).substring(0, 10);
        
        // Calculate cycle day
        int daysSinceStart = i;
        int cycleDay = (daysSinceStart % cycleLength) + 1;
        
        // Determine day type and phase
        string dayType = "regular";
        string phase = "follicular";
        boolean isPredicted = i > 0; // First day is actual data
        
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

public function main() {
    log:printInfo("Period Prediction Service is starting on port 9093...");
}
