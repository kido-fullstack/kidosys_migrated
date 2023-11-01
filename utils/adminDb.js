const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');

module.exports = Object.assign({}, {
  createSystemUser: (admin) => {
    return new Promise(async (resolve, reject) => {
      console.log('Checking system user in DB...');
      const user = await Employee.findOne({ email: admin.email });
      if (user) {
        console.log('System user already present! Please check config.');
        return resolve();
      } else {
        console.log('System user not found.')
        console.log('Creating System User now...');
        bcrypt.hash(admin.password, 10, async function (err, hash) {
          if (err) {
            console.log('Err in helpers bcrypt');
            return resolve();
          }
          const newEmployee = new Employee({
            user_unique_id: admin.userUniqueId,
            emp_unique_id: admin.empUniqueId,
            first_name: admin.firstName,
            last_name: admin.lastName,
            name: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
            password: hash,
            mobile: admin.phone,
            status: 'active',
            admin_approval: admin.adminApproval,
            type: admin.role,
            controlled_by: null,
            added_by: null,
            success: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await newEmployee.save((err, result) => {
            if (err) {
              console.log('Err in creating system users');
              return resolve();
            }
            console.log('System user created!');
            return resolve();
          })
        })
      }
    })
  }
})