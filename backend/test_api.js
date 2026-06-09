async function test() {
  try {
    // get permissions for role_id 1
    const res1 = await fetch('http://localhost:5000/api/role-permissions/1');
    const data1 = await res1.json();
    console.log('GET role 1:', data1);

    // update permissions for role_id 1
    const updateBody = {
      permissions: [
        { module_name: 'Dashboard', can_view: true, can_create: false, can_update: false, can_delete: false }
      ]
    };
    const res2 = await fetch('http://localhost:5000/api/role-permissions/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody)
    });
    const data2 = await res2.json();
    console.log('PUT role 1:', data2);

    // fetch again
    const res3 = await fetch('http://localhost:5000/api/role-permissions/1');
    const data3 = await res3.json();
    console.log('GET role 1 after update:', data3);

  } catch (err) {
    console.error(err);
  }
}

test();
