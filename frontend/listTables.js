const key = 'sb_publishable_j0jSUS80_ZszT72k_SeTmg_Jxl4dnU7';
fetch('https://ahvhbkioncgrfklwpqos.supabase.co/rest/v1/', {
  headers: { apikey: key }
})
.then(res => res.json())
.then(data => {
  if (data && data.definitions) {
    console.log("Found tables in Supabase:");
    const tables = Object.keys(data.definitions);
    console.log(tables);
  } else {
    console.log(data);
  }
})
.catch(console.error);
