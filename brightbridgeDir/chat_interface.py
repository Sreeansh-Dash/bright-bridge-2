#!/usr/bin/env python3
import sys
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from bridgebright.agent import root_agent
    
    def main():
        if len(sys.argv) < 2:
            print("Error: No message provided")
            return
        
        user_message = sys.argv[1]
        user_name = sys.argv[2] if len(sys.argv) > 2 else "User"
        
        try:
            # Create a personalized message
            if user_name and user_name != "User":
                personalized_message = f"User {user_name} says: {user_message}"
            else:
                personalized_message = user_message
            
            # Get response from the root agent
            response = root_agent.send_message(personalized_message)
            
            # Print the response (this will be captured by Node.js)
            print(response)
            
        except Exception as e:
            print(f"I apologize, but I'm having trouble processing your request right now. Please try again in a moment. (Error: {str(e)})")
    
    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print(f"Error importing BrightBridge agents: {str(e)}")
    print("Please ensure all dependencies are installed and the environment is properly configured.")
except Exception as e:
    print(f"Unexpected error: {str(e)}")