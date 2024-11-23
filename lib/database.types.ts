export type Database = {
    public: {
      Tables: {
        // ... existing tables ...
        meal_plans: {
          Row: {
            id: string
            user_id: string
            meal_id: string
            delivery_time: string
            frequency: string
            status: string
          }
          Insert: {
            id?: string
            user_id: string
            meal_id: string
            delivery_time: string
            frequency: string
            status: string
          }
          Update: {
            id?: string
            user_id?: string
            meal_id?: string
            delivery_time?: string
            frequency?: string
            status?: string
          }
        }
        // ... other tables ...
      }
    }
  }