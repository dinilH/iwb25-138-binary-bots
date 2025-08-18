import ballerina/http;
import ballerina/log;

type WellnessEntry record {
    string userId;              
    string date;                
    int mood;                   
    int energy;                 
    decimal sleep;              
    int water;                  
    string notes?;              
};


map<WellnessEntry[]> wellnessStore = {};


@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000", "http://localhost:3001"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
service /api/wellness on new http:Listener(8082) {


    resource function get health() returns json {
        log:printInfo("Wellness service health check - Pure Ballerina implementation");
        return {
            success: true,
            message: "Wellness API running with pure Ballerina processing",
            timestamp: "2025-07-28T15:00:00Z"
        };
    }


    resource function post entries(@http:Payload WellnessEntry entry) returns json {
        log:printInfo("Adding wellness entry for user: " + entry.userId);
        
       
        WellnessEntry[] userEntries = wellnessStore[entry.userId] ?: [];
        userEntries.push(entry);
        wellnessStore[entry.userId] = userEntries;
        
        return {
            success: true,
            message: "Wellness entry added successfully with Ballerina processing",
            data: entry.toJson()
        };
    }


    resource function get users/[string userId]/entries() returns json {
        log:printInfo("Fetching wellness entries for user: " + userId);
        
      
        WellnessEntry[] entries = wellnessStore[userId] ?: [];
        
        return {
            success: true,
            message: "Wellness entries retrieved with Ballerina",
            data: entries.toJson()
        };
    }
}
