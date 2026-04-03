import { useEffect } from "preact/hooks";

interface RedirectCrUXVisProps {
  redirectUrl: string;
}

export default function RedirectCrUXVis(props: RedirectCrUXVisProps) {
  useEffect(() => {
    setTimeout(() => {
      location.href = props.redirectUrl;
    }, 1000);
  }, []);

  return (
    <div>
      <p>Redirecting to CrUX Vis in 1 second...</p>
      <p>
        If you are not redirected automatically, please{" "}
        <a href={props.redirectUrl}>click here</a>.
      </p>
    </div>
  );
}
