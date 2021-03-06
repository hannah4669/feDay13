export const priceFormatter = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
};

export const API_URL = ' http://localhost:2000'
export const API_URL_SQL = 'http://localhost:4669'
export const HOME_URL = 'http://localhost:3000/'

export const dateformat=(n)=>{
  var today = new Date(n);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;
  return today
}