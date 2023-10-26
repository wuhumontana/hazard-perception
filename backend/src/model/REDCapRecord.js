class REDCapRecord {
  constructor(
    participant_id,
    first_name,
    last_name,
    email,
    role,
    date_joined,
    is_activated,
    user_information_complete,

    is_completed_all,
    is_completed_intersections_ha,
    is_completed_intersections_am,
    is_completed_rear_end_ha,
    is_completed_rear_end_am,
    is_completed_curves_ha,
    is_completed_curves_am,

    intersections_ha___1_s,
    intersections_ha___1_t,
    intersections_ha___2_s,
    intersections_ha___2_t,
    intersections_ha___3_s,
    intersections_ha___3_t,
    intersections_ha___4_s,
    intersections_ha___4_t,
    intersections_ha___5_s,
    intersections_ha___5_t,
    intersections_ha___6_s,
    intersections_ha___6_t,

    intersections_am___1,
    intersections_am___2,
    intersections_am___3,
    intersections_am___4,
    intersections_am___5,
    intersections_am___6,
 

    rear_end_ha___1_s,
    rear_end_ha___1_t,
    rear_end_ha___2_s,
    rear_end_ha___2_t,
    rear_end_ha___3_s,
    rear_end_ha___3_t,
    rear_end_ha___4_s,
    rear_end_ha___4_t,
    rear_end_ha___5_s,
    rear_end_ha___5_t,
    rear_end_ha___6_s,
    rear_end_ha___6_t,

    rear_end_am___1,
    rear_end_am___2,
    rear_end_am___3,
    rear_end_am___4,
    rear_end_am___5,
    rear_end_am___6,


    curves_ha___1_s,
    curves_ha___1_t,
    curves_ha___2_s,
    curves_ha___2_t,
    curves_ha___3_s,
    curves_ha___3_t,
    curves_ha___4_s,
    curves_ha___4_t,
    curves_ha___5_s,
    curves_ha___5_t,
    curves_ha___6_s,
    curves_ha___6_t,

    curves_am___1,
    curves_am___2,
    curves_am___3,
    curves_am___4,
    curves_am___5,
    curves_am___6,

    percentage_completion,
    testing_progress_complete
  ) {
    this.participant_id = participant_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.role = role;
    this.date_joined = date_joined;
    this.is_activated = is_activated;
    this.user_information_complete = user_information_complete;
    this.is_completed_all = is_completed_all;
    this.is_completed_intersections_ha = is_completed_intersections_ha;
    this.is_completed_intersections_am = is_completed_intersections_am;
    this.is_completed_rear_end_ha = is_completed_rear_end_ha;
    this.is_completed_rear_end_am = is_completed_rear_end_am;
    this.is_completed_curves_ha = is_completed_curves_ha;
    this.is_completed_curves_am = is_completed_curves_am;

    this.intersections_ha___1_s = intersections_ha___1_s;
    this.intersections_ha___1_t = intersections_ha___1_t;
    this.intersections_ha___2_s = intersections_ha___2_s;
    this.intersections_ha___2_t = intersections_ha___2_t;
    this.intersections_ha___3_s = intersections_ha___3_s;
    this.intersections_ha___3_t = intersections_ha___3_t;
    this.intersections_ha___4_s = intersections_ha___4_s;
    this.intersections_ha___4_t = intersections_ha___4_t;
    this.intersections_ha___5_s = intersections_ha___5_s;
    this.intersections_ha___5_t = intersections_ha___5_t;
    this.intersections_ha___6_s = intersections_ha___6_s;
    this.intersections_ha___6_t = intersections_ha___6_t;

    this.intersections_am___1 = intersections_am___1;
    this.intersections_am___2 = intersections_am___2;
    this.intersections_am___3 = intersections_am___3;
    this.intersections_am___4 = intersections_am___4;
    this.intersections_am___5 = intersections_am___5;
    this.intersections_am___6 = intersections_am___6;

    this.rear_end_ha___1_s = rear_end_ha___1_s;
    this.rear_end_ha___1_t = rear_end_ha___1_t;
    this.rear_end_ha___2_s = rear_end_ha___2_s;
    this.rear_end_ha___2_t = rear_end_ha___2_t;
    this.rear_end_ha___3_s = rear_end_ha___3_s;
    this.rear_end_ha___3_t = rear_end_ha___3_t;
    this.rear_end_ha___4_s = rear_end_ha___4_s;
    this.rear_end_ha___4_t = rear_end_ha___4_t;
    this.rear_end_ha___5_s = rear_end_ha___5_s;
    this.rear_end_ha___5_t = rear_end_ha___5_t;
    this.rear_end_ha___6_s = rear_end_ha___6_s;
    this.rear_end_ha___6_t = rear_end_ha___6_t;

    this.rear_end_am___1 = rear_end_am___1;
    this.rear_end_am___2 = rear_end_am___2;
    this.rear_end_am___3 = rear_end_am___3;
    this.rear_end_am___4 = rear_end_am___4;
    this.rear_end_am___5 = rear_end_am___5;
    this.rear_end_am___6 = rear_end_am___6;


    this.curves_ha___1_s = curves_ha___1_s;
    this.curves_ha___1_t = curves_ha___1_t;
    this.curves_ha___2_s = curves_ha___2_s;
    this.curves_ha___2_t = curves_ha___2_t;
    this.curves_ha___3_s = curves_ha___3_s;
    this.curves_ha___3_t = curves_ha___3_t;
    this.curves_ha___4_s = curves_ha___4_s;
    this.curves_ha___4_t = curves_ha___4_t;
    this.curves_ha___5_s = curves_ha___5_s;
    this.curves_ha___5_t = curves_ha___5_t;
    this.curves_ha___6_s = curves_ha___6_s;
    this.curves_ha___6_t = curves_ha___6_t;

    this.curves_am___1 = curves_am___1;
    this.curves_am___2 = curves_am___2;
    this.curves_am___3 = curves_am___3;
    this.curves_am___4 = curves_am___4;
    this.curves_am___5 = curves_am___5;
    this.curves_am___6 = curves_am___6;
   
    this.percentage_completion = percentage_completion;
    this.testing_progress_complete = testing_progress_complete;
  }
}

export default REDCapRecord;
