/**
 * Default callback for store functions
 *
 * @param   {Error} err - error passed in from memory-store
 * @return  {multiple} - The data that was requested.
 */
export function storeCb(err, data) {
  if (err) {
    throw err;
  }

  if(data) {
    return data;
  }
}