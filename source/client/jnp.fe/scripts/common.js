var currentUser = {}

var tthc = {};

(() => {
  var baseUrl = getDvcBaseUrlGlobal();
  const params = new URL(window.location.href).searchParams;
  let tthcId = params.get('tthcId');
  const idForm = params.get('idForm');

  if (tthcId) {
    const payload = {
      "title": "dm_ThuTucHanhChinh",
      "filter": "Id=@p0",
      "params": [tthcId]
    }
    var url1 = baseUrl + "/api/v1/common/query";
    console.log("URL::", url1)
    fetch(url1, {
      method: "POST",
      headers: {
        "Content-Type": 'application/json',
        accept: 'application/json;odata=nometadata'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        const value = data?.data?.items;
        if (value) {
          tthc = value[0];
        }
      });

    return;
  }

  const url = `${baseUrl}/api/v1/common/query`;

  if (idForm) {
    const payload = {
      "title": "dm_FormTiepNhanThuTuc",
      "filter": "Id=@p0",
      "params": [idForm]
    }
    try {
     fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": 'application/json',
            accept: 'application/json;odata=nometadata'
          },
          body: JSON.stringify(payload)
        }
      ).then((_res) => _res.json()).then(_data => {
          if (_data?.data?.items?.length > 0) {
            tthcId = _data?.data?.items[0].ThuTucId
          }
  
          if (tthcId) {
            const payload = {
              "title": "dm_ThuTucHanhChinh",
              "filter": "Id=@p0",
              "params": [tthcId]
            }
            var urlTthhc = baseUrl + "/api/v1/common/query";
            
            fetch(urlTthhc, {
              method: "POST",
              headers: {
                "Content-Type": 'application/json',
                accept: 'application/json;odata=nometadata'
              },
              body: JSON.stringify(payload)
            })
              .then((res) => res.json())
              .then((data) => {
                const value = data?.data?.items;
  
                if (value) {
                  tthc = value[0];
                }
              });
          }
      });
    } catch (error) {
      throw new Error(`apiGetThuTucHanhIdByIdForm: ${error}`);
    }
  }
})()

function recursiveGetData(formData, targetKey) {
  if (!targetKey) return null;

  let found = null;

  for (const [key] of Object.entries(formData)) {
    if (key !== targetKey) {
      if (typeof formData[key] === 'object') {
        found = recursiveGetData(formData[key], targetKey);
        if (found) {
          break;
        }
      }
    } else {
      found = formData[targetKey];
      break;
    }
  }

  return found;
};
