/**
 * This function will assign deep
 *
 * @param {Object} [targetObject] - The object we want to assign into
 * @param {Object} [sourceObject] - The object we want to assign from
 * @returns {Object}
 */
export default function AssignDeep (targetObject = {}, sourceObject = {}) {
  // Copy the targetObject into a temporary result
  const result = { ...targetObject };

  // Now copy each key values in sourceObject into result regardless if value is falsy because
  // falsy could be the intended state. That's why we don't use $.extend anymore.
  if (Object
    .keys(sourceObject)
    .length > 0
  ) {
    Object
      .keys(sourceObject)
      .forEach((key) => {
        let value = sourceObject[key];

        // Make sure the sourceObject[key] is really an object
        if (value
          && !Array.isArray(value)
          && Object.keys(value).length
          && value instanceof Object
          // Check if the target has the key
          && targetObject[key]
        ) {
          value = AssignDeep(targetObject[key], value);
        }

        result[key] = value;
      });
  }
  return result;
}
