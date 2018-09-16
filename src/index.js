(() => {
  const sum = (a,b,c) => {
    return a+b;
  };

  const modify = (a,b) => {
    return {a: a,b};
  };

  sum(5,2);
  modify(5,2);
})();
