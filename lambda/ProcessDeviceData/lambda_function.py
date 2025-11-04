import json
import boto3
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('DeviceDataTable')

def convert_to_decimal(obj):
    """Convert float to Decimal for DynamoDB compatibility"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_decimal(i) for i in obj]
    return obj

def lambda_handler(event, context):
    print("=" * 60)
    print("📩 RECEIVED EVENT FROM IOT CORE:")
    print(json.dumps(event, indent=2, default=str))
    print("=" * 60)
    
    try:
        # IoT Core sends payload directly
        payload = event
        
        # Validate required fields
        if "device_id" not in payload:
            raise ValueError("Missing required field: device_id")
        
        device_id = payload.get("device_id")
        timestamp = payload.get("timestamp", datetime.utcnow().isoformat())
        
        print(f"✅ Device ID: {device_id}")
        print(f"✅ Timestamp: {timestamp}")
        
        # Build item for DynamoDB
        item = {
            "device_id": device_id,
            "timestamp": timestamp,
            "machine_details": payload.get("machine_details", ""),
            "engine_rpm": convert_to_decimal(payload.get("engine_rpm", 0)),
            "engine_temp": convert_to_decimal(payload.get("engine_temp", 0)),
            "oil_pressure": convert_to_decimal(payload.get("oil_pressure", 0)),
            "battery_monitor": convert_to_decimal(payload.get("battery_monitor", 0)),
            "location": convert_to_decimal(payload.get("location", {})),
            "mpu6050": convert_to_decimal(payload.get("mpu6050", {})),
            "gnss": convert_to_decimal(payload.get("gnss", {})),
            "on_off_time": payload.get("on_off_time", ""),
        }
        
        print("💾 INSERTING INTO DYNAMODB:")
        print(json.dumps(item, indent=2, default=str))
        
        # Insert into DynamoDB
        response = table.put_item(Item=item)
        
        print("✅ SUCCESSFULLY STORED IN DYNAMODB")
        print(f"Response: {response}")
        print("=" * 60)
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Data stored successfully",
                "device_id": device_id,
                "timestamp": timestamp
            })
        }
        
    except Exception as e:
        print("=" * 60)
        print("❌ ERROR OCCURRED:")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        
        import traceback
        print("📋 FULL TRACEBACK:")
        print(traceback.format_exc())
        print("=" * 60)
        
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e),
                "device_id": event.get("device_id", "unknown")
            })
        }