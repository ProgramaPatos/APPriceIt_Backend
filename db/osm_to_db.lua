-- -*- compile-command: "osm2pgsql -d <db_name> -O flex -S osm_to_db.lua shpdir/<file.osm.*>" -*-
-- This is a Lua script based on https://osm2pgsql.org/examples/poi-db/
-- to transform the OSM shapefile into a pgsql/postGIS valid format and upload it
-- to the database

-- local osm2pgsql = require("osm2pgsql")
-- print(osm2pgsql)
-- local inspect = require("inspect")
print("Holaaa")

local poi_st_name = "store_staging"
local poi_st_name_pre = poi_st_name .. "_"
local poi_db_table = osm2pgsql.define_table({
  name = poi_st_name,
  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },
  columns = {
    { column = poi_st_name_pre .. 'name' },
    { column = poi_st_name_pre .. 'id',   type = 'bigint', not_null = true },
    { column = poi_st_name_pre .. 'geom', type = 'point',  not_null = true },
  }
})
-- A manual autoincrement id to facilitate post staging processing,
-- this id will be used to relate the pois with its tags
-- we don't keep it because its preferable to use a table with a serial
-- data type as primary key, additionally if we use the serial data type
-- in this config we cannot get it for use in the tags table
local global_poi_id = 0
function get_poi_id()
  local last = global_poi_id
  global_poi_id = global_poi_id + 1
  return last
end

local tag_st_name = "tag_staging"
local tag_st_name_pre = tag_st_name .. "_"
local tag_db_table = osm2pgsql.define_table({
  name = tag_st_name,
  columns = {
    { column = tag_st_name_pre .. 'name', type = "text",   not_null = false }, -- There are pois without name
    { column = tag_st_name_pre .. 'id',   type = 'bigint', not_null = true }
  }
})
-- another manual autoincrement id that identificates tags
local global_tag_id = 0
local tags_table = {}
function get_tag_id()
  local last = global_tag_id
  global_tag_id = global_tag_id + 1
  return last
end

local storetag_st_name = "storetag_staging"
local storetag_st_name_pre = storetag_st_name .. "_"
local storetag_db_table = osm2pgsql.define_table({
  name = storetag_st_name,
  columns = {
    { column = storetag_st_name_pre .. 'store_id', type = 'bigint', not_null = true },
    { column = storetag_st_name_pre .. 'tag_id',   type = 'bigint', not_null = true }
  }
})

-- Now we could make a query like
-- SELECT  poi_staging_name, tag_staging_name
--      FROM poi_staging
--      LEFT JOIN storetag_staging ON storetag_staging_store_id = poi_staging_id
--      LEFT JOIN tag_staging ON storetag_staging_tag_id = tag_staging_id;



function process_poi(object, geom)
  local poi_id = get_poi_id()
  local a = {
    [poi_st_name_pre .. 'name'] = object.tags.name,
    [poi_st_name_pre .. "geom"] = geom,
    [poi_st_name_pre .. "id"] = poi_id
  }

  local tags = {}



  if object.tags.amenity then
    table.insert(tags, 'amenity')
    table.insert(tags, object.tags.amenity)
  elseif object.tags.shop then
    table.insert(tags, 'shop')
    table.insert(tags, object.tags.shop)
  else
    return
  end

  poi_db_table:insert(a)

  for _, tag in pairs(tags) do
    local tag_id = tags_table[tag]
    if not tag_id then
      tag_id = get_tag_id()
      tags_table[tag] = tag_id
      tag_db_table:insert({
        [tag_st_name_pre .. "name"] = tag,
        [tag_st_name_pre .. "id"] = tag_id
      })
    end
    storetag_db_table:insert({
      [storetag_st_name_pre .. "store_id"] = poi_id,
      [storetag_st_name_pre .. "tag_id"] = tag_id
    })
  end
end

function osm2pgsql.process_node(object)
  process_poi(object, object:as_point())
end

function osm2pgsql.process_way(object)
  if object.is_closed and object.tags.building then
    process_poi(object, object:as_polygon():centroid())
  end
end
