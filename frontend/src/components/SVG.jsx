import { useEffect, useRef, useState } from "react";

/**
 *
 * @param {React.SVGProps & {id: string}} props
 * @returns {React.JSX.Element}
 */
export function SVG(props) {
  const IconRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    import(`../assets/${props.id}.svg`)
      .then((res) => (IconRef.current = res.ReactComponent))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [props.id]);

  return IconRef.current && <IconRef.current {...props} />;
}
