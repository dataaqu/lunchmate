"use client";

import { useState } from "react";
import {
  DISTRICTS,
  DISTRICT_MAP_WIDTH,
  DISTRICT_MAP_HEIGHT,
} from "@/data/districts";

interface Props {
  activeDistrict?: string | null;
  onSelect: (name: string | null) => void;
  className?: string;
}

function coordsToSvgPoints(coords: string): string {
  const parts = coords.split(",");
  const pairs: string[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    pairs.push(`${parts[i]},${parts[i + 1]}`);
  }
  return pairs.join(" ");
}

export function DistrictMap({
  activeDistrict = null,
  onSelect,
  className,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(name: string) {
    onSelect(activeDistrict === name ? null : name);
  }

  return (
    <div className={`relative w-full${className ? ` ${className}` : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tbilisi-map.png"
        alt="თბილისის უბნების სქემატური რუკა"
        width={DISTRICT_MAP_WIDTH}
        height={DISTRICT_MAP_HEIGHT}
        useMap="#tbilisi-districts"
        draggable={false}
        className="block w-full select-none"
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${DISTRICT_MAP_WIDTH} ${DISTRICT_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {DISTRICTS.map((district) => {
          const isActive = activeDistrict === district.name;
          const isHovered = hovered === district.name;

          return (
            <polygon
              key={district.name}
              points={coordsToSvgPoints(district.coords)}
              fill={district.color}
              stroke={district.color}
              strokeWidth={2}
              style={{
                fillOpacity: isActive ? 0.6 : isHovered ? 0.4 : 0.15,
                strokeOpacity: isActive || isHovered ? 0.9 : 0.4,
                cursor: "pointer",
                transition:
                  "fill-opacity 0.15s ease, stroke-opacity 0.15s ease",
              }}
              onMouseEnter={() => setHovered(district.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(district.name)}
            />
          );
        })}
      </svg>

      <map name="tbilisi-districts">
        {DISTRICTS.map((district) => (
          <area
            key={district.name}
            shape="poly"
            coords={district.coords}
            href="#"
            aria-label={district.label}
            onClick={(e) => {
              e.preventDefault();
              handleClick(district.name);
            }}
            onFocus={() => setHovered(district.name)}
            onBlur={() => setHovered(null)}
          />
        ))}
      </map>
    </div>
  );
}
