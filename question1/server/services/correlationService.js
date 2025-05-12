
const calculateCorrelation = (data1, data2) => {
  if (data1.length !== data2.length) {
    throw new Error("The data sets must have the same length");
  }

  const firstMean = data1.reduce((acc, d) => acc + d.price, 0) / data1.length;
  const secondMean = data2.reduce((acc, d) => acc + d.price, 0) / data2.length;

  const coVariance =
    data1.reduce((acc, d1, i) => {
      return acc + (d1.price - firstMean) * (data2[i].price - secondMean);
    }, 0) /
    (data1.length - 1);

  const standardDev1 = Math.sqrt(
    data1.reduce((accumulator, currentDataPoint) => {
      const squaredDifference = Math.pow(currentDataPoint.price - firstMean, 2);
      return accumulator + squaredDifference;
    }, 0) /
      (data1.length - 1)
  );

  const standardDev2 = Math.sqrt(
    data2.reduce((accumulator, currentDataPoint) => {
      const squaredDifference = Math.pow(currentDataPoint.price - secondMean, 2);
      return accumulator + squaredDifference;
    }, 0) /
      (data2.length - 1)
  );

  return coVariance / (standardDev1 * standardDev2); 

};


export default calculateCorrelation
