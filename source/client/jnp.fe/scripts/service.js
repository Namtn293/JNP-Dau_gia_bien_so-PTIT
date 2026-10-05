
async function xuatToKhai(jsonSchema) {
  const params = new URL(window.location.href).searchParams;
  let tthcId = params.get('tthcId') || params.get('tthcid');
  
  if(tthcId) {
    var baseUrl = getDvcBaseUrlGlobal();
    var url = baseUrl + "/api/v1/hoso/tokhai";
    var body = {
      thuTucId: tthcId,
      payload: jsonSchema
    }
    try {
      const data = await fetch(url,{
          method: 'POST',
          headers: {
            "Content-Type": "application/json", 
            Accept: 'application/json; odata=nometadata',
          },
          body: JSON.stringify(body),
        });
      if (data?.data?.id) {
        return data.data;
      }
    } catch (error) {
      throw new Error(`XuatToKhai: ${error}`);
    }
  }
}

async function nopToKhai(jsonSchema) {
  const params = new URL(window.location.href).searchParams;
  let tthcId = params.get('tthcId');
  const hsid = params.get('hsid') || params.get('hsId');
  if(tthcId) {
    var baseUrl = getDvcBaseUrlGlobal();
    var url = baseUrl + "/api/v1/hoso";
    var body = {
      action: hsid ? 'updatehoso' : 'nophoso',
      thuTucId: tthcId,
      hoSoId: hsid || 0,
      payload: jsonSchema
    }
    try {
      const data = await fetch(url,{
          method: 'POST',
          headers: {
            "Content-Type": "application/json", 
            Accept: 'application/json; odata=nometadata',
          },
          body: JSON.stringify(body),
        });
      if (data?.data?.id) {
        return data.data;
      }
    } catch (error) {
      throw new Error(`XuatToKhai: ${error}`);
    }
  }
}